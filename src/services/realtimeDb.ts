import { 
  collection, 
  doc, 
  onSnapshot, 
  setDoc, 
  deleteDoc, 
  writeBatch,
  getDocs,
  getDocFromServer
} from 'firebase/firestore';
import { db, auth } from '../firebase';
import { 
  Gudep, 
  Member, 
  CollectiveKtaBatch, 
  ArchiveDocument, 
  SemesterReport, 
  SecretariatContact,
  HeroBackgroundConfig,
  DEFAULT_HERO_BACKGROUND,
  GudepRegistration
} from '../types';
import { PengurusAccountItem, INITIAL_PRESET_ACCOUNTS, getCustomPengurusList } from '../utils/auth';
import { DEFAULT_SECRETARIAT_CONTACT } from '../utils/storage';
import { 
  INITIAL_ARCHIVES, 
  INITIAL_SEMESTER_REPORTS 
} from '../data/initialData';

// Firestore Error Information conforming to Firebase Integration Skill
export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null): FirestoreErrorInfo {
  const errMessage = error instanceof Error ? error.message : String(error);
  const errInfo: FirestoreErrorInfo = {
    error: errMessage,
    authInfo: {
      userId: auth.currentUser?.uid || null,
      email: auth.currentUser?.email || null,
      emailVerified: auth.currentUser?.emailVerified || null,
      isAnonymous: auth.currentUser?.isAnonymous || null,
      tenantId: auth.currentUser?.tenantId || null,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };

  console.warn('Firestore Operation Status:', JSON.stringify(errInfo));
  if (errMessage.includes('Missing or insufficient permissions') || errMessage.includes('permission-denied')) {
    throw new Error(JSON.stringify(errInfo));
  }
  return errInfo;
}

// Connection test as prescribed by Firebase Integration Skill
export async function testConnection(): Promise<boolean> {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
    return true;
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn("Client is operating in offline mode or initial connection in progress.");
    }
    return false;
  }
}

// Collection Names in Firestore
const COLL_GUDEP = 'gudep_list';
const COLL_MEMBERS = 'members_list';
const COLL_KTA_BATCHES = 'kta_batches';
const COLL_ARCHIVES = 'archives_list';
const COLL_SEMESTER_REPORTS = 'semester_reports';
const COLL_PENGURUS = 'pengurus_list';
const COLL_REGISTRATIONS = 'gudep_registrations';
const COLL_SETTINGS = 'system_settings';
const DOC_SECRETARIAT = 'secretariat_contact';
const DOC_HERO_BG = 'hero_background';

// Helper to purge legacy dummy data from Firestore once
const PURGE_CLOUD_DUMMY_KEY = 'siska_purged_cloud_dummy_v2026_final';
export async function purgeLegacyDummyDataFromCloud() {
  if (typeof window === 'undefined') return;
  if (localStorage.getItem(PURGE_CLOUD_DUMMY_KEY)) return;
  
  try {
    // Purge Gudep
    const gudepSnap = await getDocs(collection(db, COLL_GUDEP));
    if (!gudepSnap.empty) {
      const batch = writeBatch(db);
      gudepSnap.forEach((d) => batch.delete(d.ref));
      await batch.commit();
    }
    // Purge Members
    const memSnap = await getDocs(collection(db, COLL_MEMBERS));
    if (!memSnap.empty) {
      const batch = writeBatch(db);
      memSnap.forEach((d) => batch.delete(d.ref));
      await batch.commit();
    }
    // Purge KTA Batches
    const batchSnap = await getDocs(collection(db, COLL_KTA_BATCHES));
    if (!batchSnap.empty) {
      const batch = writeBatch(db);
      batchSnap.forEach((d) => batch.delete(d.ref));
      await batch.commit();
    }
    // Purge dummy mock registrations
    const regSnap = await getDocs(collection(db, COLL_REGISTRATIONS));
    if (!regSnap.empty) {
      const batch = writeBatch(db);
      regSnap.forEach((d) => {
        if (d.id === 'reg-gudep-mtsmanbaul' || d.id === 'reg-gudep-sdnkebonpedes1') {
          batch.delete(d.ref);
        }
      });
      await batch.commit();
    }
    localStorage.setItem(PURGE_CLOUD_DUMMY_KEY, 'true');
    console.log('Successfully purged legacy mock data from Firestore.');
  } catch (err) {
    console.warn('Notice on purging legacy mock data:', err);
  }
}

// Function to manually clear all Gudep and Member data from Cloud
export async function clearAllGudepAndMembersFromCloud() {
  try {
    const gudepSnap = await getDocs(collection(db, COLL_GUDEP));
    if (!gudepSnap.empty) {
      const batch = writeBatch(db);
      gudepSnap.forEach((d) => batch.delete(d.ref));
      await batch.commit();
    }
    const memSnap = await getDocs(collection(db, COLL_MEMBERS));
    if (!memSnap.empty) {
      const batch = writeBatch(db);
      memSnap.forEach((d) => batch.delete(d.ref));
      await batch.commit();
    }
    const batchSnap = await getDocs(collection(db, COLL_KTA_BATCHES));
    if (!batchSnap.empty) {
      const batch = writeBatch(db);
      batchSnap.forEach((d) => batch.delete(d.ref));
      await batch.commit();
    }
  } catch (err) {
    console.warn('Error clearing cloud gudep & members:', err);
  }
}

// Helper to check if system collections are empty, and seed only administrative archives/reports
export async function seedInitialDataIfEmpty() {
  try {
    // Purge any legacy sample gudep/members from Firestore
    await purgeLegacyDummyDataFromCloud();

    // Sesuai SOP & Permintaan User:
    // Gugus Depan dan Anggota TIDAK di-seed otomatis. 
    // Gudep HANYA masuk melalui registrasi, dan Anggota HANYA dimasukkan oleh akun Gudep yang terverifikasi.

    const archSnap = await getDocs(collection(db, COLL_ARCHIVES));
    if (archSnap.empty && INITIAL_ARCHIVES.length > 0) {
      console.log('Seeding initial Archives to Firestore...');
      const batch = writeBatch(db);
      INITIAL_ARCHIVES.forEach((a) => {
        batch.set(doc(db, COLL_ARCHIVES, a.id), a);
      });
      await batch.commit();
    }

    const reportSnap = await getDocs(collection(db, COLL_SEMESTER_REPORTS));
    if (reportSnap.empty && INITIAL_SEMESTER_REPORTS.length > 0) {
      console.log('Seeding initial Semester Reports to Firestore...');
      const batch = writeBatch(db);
      INITIAL_SEMESTER_REPORTS.forEach((r) => {
        batch.set(doc(db, COLL_SEMESTER_REPORTS, r.id), r);
      });
      await batch.commit();
    }

    const pengurusSnap = await getDocs(collection(db, COLL_PENGURUS));
    if (pengurusSnap.empty) {
      console.log('Seeding initial Pengurus list to Firestore...');
      const batch = writeBatch(db);
      const listToSeed = getCustomPengurusList();
      listToSeed.forEach((p) => {
        batch.set(doc(db, COLL_PENGURUS, p.id), p);
      });
      await batch.commit();
    }

    // Seed secretariat contact if needed
    const secRef = doc(db, COLL_SETTINGS, DOC_SECRETARIAT);
    await setDoc(secRef, DEFAULT_SECRETARIAT_CONTACT, { merge: true });
  } catch (err) {
    console.warn('Firestore initialization notice (operating offline or connection deferred):', err);
  }
}

// Realtime Subscriptions
export function subscribeToGudep(callback: (data: Gudep[]) => void) {
  return onSnapshot(collection(db, COLL_GUDEP), (snapshot) => {
    if (snapshot.empty) {
      callback([]);
      return;
    }
    const items: Gudep[] = [];
    snapshot.forEach((docSnap) => items.push(docSnap.data() as Gudep));
    callback(items);
  }, (err) => {
    handleFirestoreError(err, OperationType.GET, COLL_GUDEP);
  });
}

export function subscribeToMembers(callback: (data: Member[]) => void) {
  return onSnapshot(collection(db, COLL_MEMBERS), (snapshot) => {
    if (snapshot.empty) {
      callback([]);
      return;
    }
    const items: Member[] = [];
    snapshot.forEach((docSnap) => items.push(docSnap.data() as Member));
    callback(items);
  }, (err) => {
    handleFirestoreError(err, OperationType.GET, COLL_MEMBERS);
  });
}

export function subscribeToKtaBatches(callback: (data: CollectiveKtaBatch[]) => void) {
  return onSnapshot(collection(db, COLL_KTA_BATCHES), (snapshot) => {
    if (snapshot.empty) {
      callback([]);
      return;
    }
    const items: CollectiveKtaBatch[] = [];
    snapshot.forEach((docSnap) => items.push(docSnap.data() as CollectiveKtaBatch));
    callback(items);
  }, (err) => {
    handleFirestoreError(err, OperationType.GET, COLL_KTA_BATCHES);
  });
}

export function subscribeToArchives(callback: (data: ArchiveDocument[]) => void) {
  return onSnapshot(collection(db, COLL_ARCHIVES), (snapshot) => {
    if (snapshot.empty) {
      callback(INITIAL_ARCHIVES);
      return;
    }
    const items: ArchiveDocument[] = [];
    snapshot.forEach((docSnap) => items.push(docSnap.data() as ArchiveDocument));
    callback(items);
  }, (err) => {
    handleFirestoreError(err, OperationType.GET, COLL_ARCHIVES);
  });
}

export function subscribeToSemesterReports(callback: (data: SemesterReport[]) => void) {
  return onSnapshot(collection(db, COLL_SEMESTER_REPORTS), (snapshot) => {
    if (snapshot.empty) {
      callback(INITIAL_SEMESTER_REPORTS);
      return;
    }
    const items: SemesterReport[] = [];
    snapshot.forEach((docSnap) => items.push(docSnap.data() as SemesterReport));
    callback(items);
  }, (err) => {
    handleFirestoreError(err, OperationType.GET, COLL_SEMESTER_REPORTS);
  });
}

export function subscribeToPengurus(callback: (data: PengurusAccountItem[]) => void) {
  return onSnapshot(collection(db, COLL_PENGURUS), (snapshot) => {
    if (snapshot.empty) {
      callback(INITIAL_PRESET_ACCOUNTS);
      return;
    }
    const items: PengurusAccountItem[] = [];
    snapshot.forEach((docSnap) => items.push(docSnap.data() as PengurusAccountItem));
    callback(items);
  }, (err) => {
    handleFirestoreError(err, OperationType.GET, COLL_PENGURUS);
  });
}

export function subscribeToGudepRegistrations(callback: (data: GudepRegistration[]) => void) {
  return onSnapshot(collection(db, COLL_REGISTRATIONS), (snapshot) => {
    if (snapshot.empty) {
      callback([]);
      return;
    }
    const items: GudepRegistration[] = [];
    snapshot.forEach((docSnap) => items.push(docSnap.data() as GudepRegistration));
    callback(items);
  }, (err) => {
    handleFirestoreError(err, OperationType.GET, COLL_REGISTRATIONS);
  });
}

export function subscribeToSecretariatContact(callback: (data: SecretariatContact) => void) {
  return onSnapshot(doc(db, COLL_SETTINGS, DOC_SECRETARIAT), (snapshot) => {
    if (snapshot.exists()) {
      callback({ ...DEFAULT_SECRETARIAT_CONTACT, ...snapshot.data() } as SecretariatContact);
    } else {
      callback(DEFAULT_SECRETARIAT_CONTACT);
    }
  }, (err) => {
    handleFirestoreError(err, OperationType.GET, `${COLL_SETTINGS}/${DOC_SECRETARIAT}`);
  });
}

export function subscribeToHeroBackground(callback: (data: HeroBackgroundConfig) => void) {
  return onSnapshot(doc(db, COLL_SETTINGS, DOC_HERO_BG), (snapshot) => {
    if (snapshot.exists()) {
      callback({ ...DEFAULT_HERO_BACKGROUND, ...snapshot.data() } as HeroBackgroundConfig);
    } else {
      callback(DEFAULT_HERO_BACKGROUND);
    }
  }, (err) => {
    handleFirestoreError(err, OperationType.GET, `${COLL_SETTINGS}/${DOC_HERO_BG}`);
  });
}

// Database Mutation Actions (Save / Update / Delete)
export async function saveGudepToCloud(gudep: Gudep) {
  try {
    await setDoc(doc(db, COLL_GUDEP, gudep.id), gudep, { merge: true });
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, `${COLL_GUDEP}/${gudep.id}`);
  }
}

export async function deleteGudepFromCloud(id: string) {
  try {
    await deleteDoc(doc(db, COLL_GUDEP, id));
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, `${COLL_GUDEP}/${id}`);
  }
}

export async function saveMemberToCloud(member: Member) {
  try {
    await setDoc(doc(db, COLL_MEMBERS, member.id), member, { merge: true });
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, `${COLL_MEMBERS}/${member.id}`);
  }
}

export async function deleteMemberFromCloud(id: string) {
  try {
    await deleteDoc(doc(db, COLL_MEMBERS, id));
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, `${COLL_MEMBERS}/${id}`);
  }
}

export async function saveKtaBatchToCloud(batch: CollectiveKtaBatch) {
  try {
    await setDoc(doc(db, COLL_KTA_BATCHES, batch.id), batch, { merge: true });
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, `${COLL_KTA_BATCHES}/${batch.id}`);
  }
}

export async function deleteKtaBatchFromCloud(id: string) {
  try {
    await deleteDoc(doc(db, COLL_KTA_BATCHES, id));
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, `${COLL_KTA_BATCHES}/${id}`);
  }
}

export async function saveArchiveToCloud(archive: ArchiveDocument) {
  try {
    await setDoc(doc(db, COLL_ARCHIVES, archive.id), archive, { merge: true });
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, `${COLL_ARCHIVES}/${archive.id}`);
  }
}

export async function deleteArchiveFromCloud(id: string) {
  try {
    await deleteDoc(doc(db, COLL_ARCHIVES, id));
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, `${COLL_ARCHIVES}/${id}`);
  }
}

export async function saveSemesterReportToCloud(report: SemesterReport) {
  try {
    await setDoc(doc(db, COLL_SEMESTER_REPORTS, report.id), report, { merge: true });
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, `${COLL_SEMESTER_REPORTS}/${report.id}`);
  }
}

export async function deleteSemesterReportFromCloud(id: string) {
  try {
    await deleteDoc(doc(db, COLL_SEMESTER_REPORTS, id));
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, `${COLL_SEMESTER_REPORTS}/${id}`);
  }
}

export async function savePengurusToCloud(pengurus: PengurusAccountItem) {
  try {
    await setDoc(doc(db, COLL_PENGURUS, pengurus.id), pengurus, { merge: true });
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, `${COLL_PENGURUS}/${pengurus.id}`);
  }
}

export async function syncAllPengurusToCloud(list: PengurusAccountItem[]) {
  try {
    const batch = writeBatch(db);
    list.forEach((item) => {
      batch.set(doc(db, COLL_PENGURUS, item.id), item, { merge: true });
    });
    await batch.commit();
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, COLL_PENGURUS);
  }
}

export async function deletePengurusFromCloud(id: string) {
  try {
    await deleteDoc(doc(db, COLL_PENGURUS, id));
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, `${COLL_PENGURUS}/${id}`);
  }
}

export async function saveSecretariatContactToCloud(contact: SecretariatContact) {
  try {
    await setDoc(doc(db, COLL_SETTINGS, DOC_SECRETARIAT), contact, { merge: true });
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, `${COLL_SETTINGS}/${DOC_SECRETARIAT}`);
  }
}

export async function saveHeroBackgroundToCloud(config: HeroBackgroundConfig) {
  try {
    await setDoc(doc(db, COLL_SETTINGS, DOC_HERO_BG), config, { merge: true });
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, `${COLL_SETTINGS}/${DOC_HERO_BG}`);
  }
}

export async function saveGudepRegistrationToCloud(registration: GudepRegistration) {
  try {
    await setDoc(doc(db, COLL_REGISTRATIONS, registration.id), registration, { merge: true });
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, `${COLL_REGISTRATIONS}/${registration.id}`);
  }
}

export async function updateRegistrationStatusInCloud(
  id: string,
  status: 'Disetujui' | 'Ditolak' | 'Menunggu Verifikasi',
  note?: string,
  verifierName?: string
) {
  try {
    await setDoc(
      doc(db, COLL_REGISTRATIONS, id),
      {
        statusVerifikasi: status,
        catatanVerifikasi: note || (status === 'Disetujui' ? 'Disetujui dan diverifikasi oleh Pengurus Kwarran' : 'Ditolak / Perlu Revisi'),
        diverifikasiOleh: verifierName || 'Pengurus Kwarran',
        tanggalVerifikasi: new Date().toISOString()
      },
      { merge: true }
    );
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, `${COLL_REGISTRATIONS}/${id}`);
  }
}

export async function deleteGudepRegistrationFromCloud(id: string) {
  try {
    await deleteDoc(doc(db, COLL_REGISTRATIONS, id));
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, `${COLL_REGISTRATIONS}/${id}`);
  }
}

export const subscribeToRegistrations = subscribeToGudepRegistrations;
export const saveRegistrationToCloud = saveGudepRegistrationToCloud;


