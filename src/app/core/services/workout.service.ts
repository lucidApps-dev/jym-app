import { Injectable, inject } from '@angular/core';
import {
  Firestore,
  collection,
  collectionData,
  doc,
  docData,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
} from '@angular/fire/firestore';
import { Timestamp } from 'firebase/firestore';
import { Observable, map } from 'rxjs';

export interface WorkoutExercise {
  id: string;
  name: string;
  order: number;
}

export interface Workout {
  id: string;
  name: string;
  exercises: WorkoutExercise[];
  createdAt?: Timestamp | Date;
  updatedAt?: Timestamp | Date;
}

interface WorkoutDocument {
  name: string;
  exercises: WorkoutExercise[];
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

interface WorkoutDocumentWithId extends WorkoutDocument {
  id: string;
}

interface WorkoutPayload {
  name: string;
  exercises: WorkoutExercise[];
}

@Injectable({
  providedIn: 'root',
})
export class WorkoutService {
  private readonly firestore = inject(Firestore);

  getWorkouts(
    userId: string,
    sortBy: 'createdAt' | 'name' = 'createdAt'
  ): Observable<Workout[]> {
    const workoutsRef = collection(this.firestore, `users/${userId}/workouts`);
    const sortOrder =
      sortBy === 'name' ? orderBy('name', 'asc') : orderBy('createdAt', 'desc');
    const workoutsQuery = query(workoutsRef, sortOrder);

    return collectionData(workoutsQuery, { idField: 'id' }).pipe(
      map((workouts) =>
        (workouts as WorkoutDocumentWithId[]).map((workout) => ({
          id: workout.id,
          name: workout.name,
          exercises: workout.exercises || [],
          createdAt: workout.createdAt,
          updatedAt: workout.updatedAt,
        }))
      )
    );
  }

  getWorkoutById(
    userId: string,
    workoutId: string
  ): Observable<Workout | null> {
    const workoutRef = doc(
      this.firestore,
      `users/${userId}/workouts/${workoutId}`
    );

    return docData(workoutRef, { idField: 'id' }).pipe(
      map((workout) => {
        if (!workout) {
          return null;
        }
        const workoutData = workout as WorkoutDocumentWithId;
        return {
          id: workoutData.id,
          name: workoutData.name,
          exercises: workoutData.exercises || [],
          createdAt: workoutData.createdAt,
          updatedAt: workoutData.updatedAt,
        };
      })
    );
  }

  async createWorkout(
    userId: string,
    payload: WorkoutPayload
  ): Promise<string> {
    const workoutsRef = collection(this.firestore, `users/${userId}/workouts`);
    const now = Timestamp.now();

    const workoutData: WorkoutDocument = {
      name: payload.name.trim(),
      exercises: payload.exercises.map((exercise, index) => ({
        ...exercise,
        order: exercise.order ?? index + 1,
      })),
      createdAt: now,
      updatedAt: now,
    };

    const docRef = await addDoc(workoutsRef, workoutData);
    return docRef.id;
  }

  async updateWorkout(
    userId: string,
    workoutId: string,
    payload: WorkoutPayload
  ): Promise<void> {
    const workoutRef = doc(
      this.firestore,
      `users/${userId}/workouts/${workoutId}`
    );

    const updateData: Partial<WorkoutDocument> = {
      name: payload.name.trim(),
      exercises: payload.exercises.map((exercise, index) => ({
        ...exercise,
        order: exercise.order ?? index + 1,
      })),
      updatedAt: Timestamp.now(),
    };

    await updateDoc(workoutRef, updateData);
  }

  async deleteWorkout(userId: string, workoutId: string): Promise<void> {
    const workoutRef = doc(
      this.firestore,
      `users/${userId}/workouts/${workoutId}`
    );
    await deleteDoc(workoutRef);
  }
}
