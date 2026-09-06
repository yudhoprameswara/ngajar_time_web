export interface UserModel {
  uid: string;
  email: string;
  displayName: string;
  bankName: string;
  accountNumber: string;
  accountHolderName: string;
  photoUrl?: string | null;
}

export interface StudentModel {
  id: string;
  userId: string;
  name: string;
  hourlyRate: number;
  notes?: string | null;
}

export interface SessionModel {
  id: string;
  userId: string;
  studentId: string;
  studentName: string;
  hourlyRate: number;
  startTime: Date;
  endTime: Date;
  actualDurationMinutes: number;
  billedDurationMinutes: number;
  topic: string;
  totalFee: number;
}
