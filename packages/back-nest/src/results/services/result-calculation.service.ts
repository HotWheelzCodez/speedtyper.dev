import { Injectable } from '@nestjs/common';
import { Challenge } from 'src/challenges/entities/challenge.entity';
import { RacePlayer } from 'src/races/services/race-player.service';
import { Race } from 'src/races/services/race.service';

@Injectable()
export class ResultCalculationService {
  getTimeMS(race: Race, player: RacePlayer): number {
    const firstTimeStampMS = race.startTime.getTime();
    const keyStrokes = player.validKeyStrokes();
    const lastTimeStampMS = keyStrokes[keyStrokes.length - 1].timestamp;
    return lastTimeStampMS - firstTimeStampMS;
  }

  getCPM(code: string, timeMS: number): number {
    const timeSeconds = timeMS / 1000;
    const strippedCode = Challenge.getStrippedCode(code);
    const cps = strippedCode.length / timeSeconds;
    const cpm = cps * 60;
    const words = strippedCode.trim().split(' ');
    if (words.length === 0) { // Avoid division by zero
      return 0;
    }
    const totalWordLength = words.reduce((sum, word) => sum + word.length, 0);
    const avgWordLength = totalWordLength / words.length;
    const wpm = cpm / avgWordLength;
    if (wpm > 300) { // Abitrary value, change as needed, if cpm is greater they are most likely using an automation program
      return 0; // Simply give them no score 
    }
    return Math.floor(cpm);
  }

  getMistakesCount(player: RacePlayer): number {
    return player.incorrectKeyStrokes().length;
  }

  getAccuracy(player: RacePlayer): number {
    const incorrectKeyStrokes = player.incorrectKeyStrokes().length;
    const validKeyStrokes = player.validKeyStrokes().length;
    const totalKeySrokes = validKeyStrokes + incorrectKeyStrokes;
    return Math.floor((validKeyStrokes / totalKeySrokes) * 100);
  }
}
