import { Course, CourseChapter, CourseLesson } from '../../models/types';
import { COURSES_A, CHAPTERS_A, LESSONS_A } from './categoryA';
import { COURSES_B, CHAPTERS_B, LESSONS_B } from './categoryB';
import { COURSES_C, CHAPTERS_C, LESSONS_C } from './categoryC';
import { COURSES_D, CHAPTERS_D, LESSONS_D } from './categoryD';
import { COURSES_E, CHAPTERS_E, LESSONS_E } from './categoryE';
import { COURSES_F, CHAPTERS_F, LESSONS_F } from './categoryF';
import { COURSES_G, CHAPTERS_G, LESSONS_G } from './categoryG';
import { COURSES_H, CHAPTERS_H, LESSONS_H } from './categoryH';
import { COURSES_I, CHAPTERS_I, LESSONS_I } from './categoryI';
import { COURSES_J, CHAPTERS_J, LESSONS_J } from './categoryJ';

export const SEED_100_COURSES: Course[] = [
  ...COURSES_A,
  ...COURSES_B,
  ...COURSES_C,
  ...COURSES_D,
  ...COURSES_E,
  ...COURSES_F,
  ...COURSES_G,
  ...COURSES_H,
  ...COURSES_I,
  ...COURSES_J,
];

export const SEED_100_CHAPTERS: CourseChapter[] = [
  ...CHAPTERS_A,
  ...CHAPTERS_B,
  ...CHAPTERS_C,
  ...CHAPTERS_D,
  ...CHAPTERS_E,
  ...CHAPTERS_F,
  ...CHAPTERS_G,
  ...CHAPTERS_H,
  ...CHAPTERS_I,
  ...CHAPTERS_J,
];

export const SEED_100_LESSONS: CourseLesson[] = [
  ...LESSONS_A,
  ...LESSONS_B,
  ...LESSONS_C,
  ...LESSONS_D,
  ...LESSONS_E,
  ...LESSONS_F,
  ...LESSONS_G,
  ...LESSONS_H,
  ...LESSONS_I,
  ...LESSONS_J,
];

export const TOTAL_SEED_COURSES_COUNT = SEED_100_COURSES.length;
export const TOTAL_SEED_CHAPTERS_COUNT = SEED_100_CHAPTERS.length;
export const TOTAL_SEED_LESSONS_COUNT = SEED_100_LESSONS.length;
