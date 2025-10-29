import { QuizQuestion } from '../types';

// Note: These audio URLs are from xeno-canto.org, a public repository of bird sounds.
// They are used here for demonstration purposes. In a production application,
// you would host these assets on a reliable CDN for performance and stability.
export const quizData: QuizQuestion[] = [
  {
    id: 1,
    audioSrc: 'https://www.xeno-canto.org/sounds/uploaded/VOLTGWADUV/XC822971-230902_06.49h_Turdus%20migratorius_L99_1m50s_16-48k.mp3',
    options: ['American Robin', 'Blue Jay', 'Northern Cardinal', 'Mourning Dove'],
    correctAnswer: 'American Robin',
  },
  {
    id: 2,
    audioSrc: 'https://www.xeno-canto.org/sounds/uploaded/RFTXRYBVBJ/XC589920-200810_013_Cyanocitta_cristata.mp3',
    options: ['House Sparrow', 'Blue Jay', 'American Crow', 'European Starling'],
    correctAnswer: 'Blue Jay',
  },
  {
    id: 3,
    audioSrc: 'https://www.xeno-canto.org/sounds/uploaded/RFTXRYBVBJ/XC589255-200806_015_Cardinalis_cardinalis.mp3',
    options: ['Downy Woodpecker', 'Black-capped Chickadee', 'Northern Cardinal', 'Tufted Titmouse'],
    correctAnswer: 'Northern Cardinal',
  },
  {
    id: 4,
    audioSrc: 'https://www.xeno-canto.org/sounds/uploaded/MIVOMKLVQS/XC812296-Mourning%20Dove%20 Paar%20und%20Gesang%2022.07.2023.mp3',
    options: ['Rock Pigeon', 'Mourning Dove', 'White-winged Dove', 'Eurasian Collared-Dove'],
    correctAnswer: 'Mourning Dove',
  },
   {
    id: 5,
    audioSrc: 'https://www.xeno-canto.org/sounds/uploaded/YNRVHGQPBN/XC817348-chickadee_2023-08-11_09-24_Z.mp3',
    options: ['American Goldfinch', 'Song Sparrow', 'Black-capped Chickadee', 'Carolina Wren'],
    correctAnswer: 'Black-capped Chickadee',
  },
];
