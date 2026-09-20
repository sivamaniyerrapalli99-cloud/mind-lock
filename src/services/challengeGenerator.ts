import { Challenge, ChallengeCategory, ChallengeOption } from '../types';

// Simple deterministic Mulberry32 PRNG
function mulberry32(seed: number) {
  return function () {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const SYMBOLS_POOL = ['✦', '▲', '●', '◈', '★', '⬡', '■', '⨂', '❖', '▲'];
const COLORS_POOL = ['GREEN', 'WHITE', 'EMERALD', 'LIME'];

export class ChallengeGenerator {
  private recentTypes: string[] = [];
  private lastNumberMemorized: number | null = null;
  private prng: () => number = Math.random;

  public setSeed(seedNumber: number) {
    this.prng = mulberry32(seedNumber);
  }

  public resetSeed() {
    this.prng = Math.random;
    this.recentTypes = [];
    this.lastNumberMemorized = null;
  }

  private getRandom(): number {
    return this.prng();
  }

  private getRandomInt(min: number, max: number): number {
    return Math.floor(this.getRandom() * (max - min + 1)) + min;
  }

  private shuffle<T>(array: T[]): T[] {
    const arr = [...array];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(this.getRandom() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }

  private recordType(type: string) {
    this.recentTypes.push(type);
    if (this.recentTypes.length > 5) {
      this.recentTypes.shift();
    }
  }

  /**
   * Generates a balanced, fair, unambiguous challenge based on round and category preference
   */
  public generateChallenge(round: number, fixedCategory?: ChallengeCategory): Challenge {
    // Determine available categories for this round
    let availableCategories: ChallengeCategory[] = ['MEMORY', 'LOGIC', 'ATTENTION', 'REACTION'];
    
    if (round >= 3) availableCategories.push('COMPARISON');
    if (round >= 5) availableCategories.push('IMPULSE');
    if (round >= 7) availableCategories.push('SEQUENCE');

    if (fixedCategory) {
      availableCategories = [fixedCategory];
    }

    // Filter out very recently used category if possible
    let cat = availableCategories[this.getRandomInt(0, availableCategories.length - 1)];

    // Timing parameters based on round
    let memorizeDuration = Math.max(900, 2000 - round * 25);
    let actionTimeLimit = Math.max(1600, 4200 - round * 45);

    let challenge: Challenge;

    switch (cat) {
      case 'MEMORY':
        challenge = this.generateMemoryChallenge(round, memorizeDuration, actionTimeLimit);
        break;
      case 'LOGIC':
        challenge = this.generateLogicChallenge(round, memorizeDuration, actionTimeLimit);
        break;
      case 'ATTENTION':
        challenge = this.generateAttentionChallenge(round, memorizeDuration, actionTimeLimit);
        break;
      case 'REACTION':
        challenge = this.generateReactionChallenge(round, memorizeDuration, actionTimeLimit);
        break;
      case 'IMPULSE':
        challenge = this.generateImpulseChallenge(round, memorizeDuration, actionTimeLimit);
        break;
      case 'SEQUENCE':
        challenge = this.generateSequenceChallenge(round, memorizeDuration, actionTimeLimit);
        break;
      case 'COMPARISON':
        challenge = this.generateComparisonChallenge(round, memorizeDuration, actionTimeLimit);
        break;
      default:
        challenge = this.generateMemoryChallenge(round, memorizeDuration, actionTimeLimit);
    }

    this.recordType(challenge.type);
    return challenge;
  }

  // --- 1. MEMORY CHALLENGES ---
  private generateMemoryChallenge(round: number, memDur: number, actDur: number): Challenge {
    const subType = round < 5 ? 0 : round < 15 ? this.getRandomInt(0, 2) : this.getRandomInt(0, 3);

    if (subType === 0) {
      // 2-digit number memory
      const targetNum = this.getRandomInt(11, 99);
      this.lastNumberMemorized = targetNum;

      // Distractors with subtle inversions or +- offset
      const d1 = parseInt(`${targetNum % 10}${Math.floor(targetNum / 10)}`, 10) || (targetNum + 10);
      const d2 = targetNum + (this.getRandom() > 0.5 ? 2 : -2);
      const d3 = (targetNum + 11) % 90 + 10;

      const wrongOptions = Array.from(new Set([d1, d2, d3]))
        .filter((n) => n !== targetNum && n >= 10 && n <= 99)
        .slice(0, round < 6 ? 1 : 3);

      while (wrongOptions.length < (round < 6 ? 1 : 3)) {
        const rand = this.getRandomInt(10, 99);
        if (rand !== targetNum && !wrongOptions.includes(rand)) {
          wrongOptions.push(rand);
        }
      }

      const allChoices = this.shuffle([
        { id: 'c', label: targetNum.toString(), isCorrect: true },
        ...wrongOptions.map((n, i) => ({ id: `w_${i}`, label: n.toString(), isCorrect: false })),
      ]);

      const correctIndex = allChoices.findIndex((c) => c.isCorrect);

      return {
        id: `mem_num_${Date.now()}_${this.getRandom()}`,
        category: 'MEMORY',
        type: 'MEM_2DIGIT',
        instruction: 'REMEMBER THIS NUMBER',
        question: 'WHAT WAS IT?',
        presentationContent: {
          type: 'number',
          value: targetNum,
        },
        options: allChoices,
        memorizeDurationMs: memDur,
        actionTimeLimitMs: actDur,
        correctOptionIndex: correctIndex,
      };
    } else if (subType === 1) {
      // 3-digit number memory (Rounds 6+)
      const targetNum = this.getRandomInt(100, 999);
      this.lastNumberMemorized = targetNum;

      const s = targetNum.toString();
      const d1 = parseInt(`${s[2]}${s[1]}${s[0]}`, 10) || (targetNum + 100);
      const d2 = parseInt(`${s[0]}${s[2]}${s[1]}`, 10) || (targetNum + 10);
      const d3 = targetNum + 5;

      const wrongOptions = Array.from(new Set([d1, d2, d3]))
        .filter((n) => n !== targetNum && n >= 100 && n <= 999)
        .slice(0, 3);

      while (wrongOptions.length < 3) {
        const rand = this.getRandomInt(100, 999);
        if (rand !== targetNum && !wrongOptions.includes(rand)) {
          wrongOptions.push(rand);
        }
      }

      const allChoices = this.shuffle([
        { id: 'c', label: targetNum.toString(), isCorrect: true },
        ...wrongOptions.map((n, i) => ({ id: `w_${i}`, label: n.toString(), isCorrect: false })),
      ]);

      return {
        id: `mem_3num_${Date.now()}_${this.getRandom()}`,
        category: 'MEMORY',
        type: 'MEM_3DIGIT',
        instruction: 'REMEMBER THIS NUMBER',
        question: 'WHAT WAS IT?',
        presentationContent: {
          type: 'number',
          value: targetNum,
        },
        options: allChoices,
        memorizeDurationMs: memDur + 200,
        actionTimeLimitMs: actDur,
        correctOptionIndex: allChoices.findIndex((c) => c.isCorrect),
      };
    } else if (subType === 2) {
      // Symbol memory
      const targetSym = SYMBOLS_POOL[this.getRandomInt(0, SYMBOLS_POOL.length - 1)];
      const distractors = SYMBOLS_POOL.filter((s) => s !== targetSym);
      const chosenDistractors = this.shuffle(distractors).slice(0, round < 6 ? 1 : 3);

      const allChoices = this.shuffle([
        { id: 'c', label: targetSym, isCorrect: true },
        ...chosenDistractors.map((s, i) => ({ id: `w_${i}`, label: s, isCorrect: false })),
      ]);

      return {
        id: `mem_sym_${Date.now()}_${this.getRandom()}`,
        category: 'MEMORY',
        type: 'MEM_SYMBOL',
        instruction: 'REMEMBER THIS SYMBOL',
        question: 'WHAT WAS THE SYMBOL?',
        presentationContent: {
          type: 'symbols',
          value: targetSym,
        },
        options: allChoices,
        memorizeDurationMs: memDur,
        actionTimeLimitMs: actDur,
        correctOptionIndex: allChoices.findIndex((c) => c.isCorrect),
      };
    } else {
      // Position memory (which position in a 4-dot circle was active)
      const positions = ['TOP', 'RIGHT', 'BOTTOM', 'LEFT'];
      const activeIdx = this.getRandomInt(0, 3);
      const targetPos = positions[activeIdx];

      const allChoices = positions.map((p, idx) => ({
        id: `p_${idx}`,
        label: p,
        isCorrect: idx === activeIdx,
      }));

      return {
        id: `mem_pos_${Date.now()}_${this.getRandom()}`,
        category: 'MEMORY',
        type: 'MEM_POSITION',
        instruction: 'REMEMBER THE ACTIVE POSITION',
        question: 'WHERE WAS THE LIGHT?',
        presentationContent: {
          type: 'grid',
          value: activeIdx,
        },
        options: allChoices,
        memorizeDurationMs: memDur,
        actionTimeLimitMs: actDur,
        correctOptionIndex: activeIdx,
      };
    }
  }

  // --- 2. SIMPLE LOGIC CHALLENGES ---
  private generateLogicChallenge(round: number, memDur: number, actDur: number): Challenge {
    const subType = this.getRandomInt(0, 2);

    if (subType === 0) {
      // WHICH IS GREATER?
      const n1 = this.getRandomInt(12, 89);
      let diff = this.getRandomInt(2, 9);
      if (this.getRandom() > 0.5) diff = -diff;
      let n2 = n1 + diff;
      if (n2 === n1) n2 = n1 + 3;

      const isN1Greater = n1 > n2;
      const choices: ChallengeOption[] = [
        { id: '1', label: n1.toString(), isCorrect: isN1Greater },
        { id: '2', label: n2.toString(), isCorrect: !isN1Greater },
      ];

      return {
        id: `logic_greater_${Date.now()}_${this.getRandom()}`,
        category: 'LOGIC',
        type: 'LOGIC_GREATER',
        instruction: 'SELECT THE HIGHER VALUE',
        question: 'WHICH IS GREATER?',
        presentationContent: {
          type: 'text',
          value: `${n1}  vs  ${n2}`,
        },
        options: choices,
        memorizeDurationMs: 0, // Direct action
        actionTimeLimitMs: Math.max(1400, actDur - 200),
        correctOptionIndex: isN1Greater ? 0 : 1,
      };
    } else if (subType === 1) {
      // WHAT COMES NEXT? (e.g. 3 -> 6 -> 9 -> ?)
      const step = this.getRandomInt(2, 5);
      const start = this.getRandomInt(1, 12);
      const seq = [start, start + step, start + step * 2];
      const correctNext = start + step * 3;

      const wrong1 = correctNext + step;
      const wrong2 = correctNext - 1;
      const wrong3 = correctNext + 2;

      const allChoices = this.shuffle([
        { id: 'c', label: correctNext.toString(), isCorrect: true },
        { id: 'w1', label: wrong1.toString(), isCorrect: false },
        { id: 'w2', label: wrong2.toString(), isCorrect: false },
        { id: 'w3', label: wrong3.toString(), isCorrect: false },
      ]);

      return {
        id: `logic_next_${Date.now()}_${this.getRandom()}`,
        category: 'LOGIC',
        type: 'LOGIC_NEXT_NUM',
        instruction: 'FIND THE PATTERN',
        question: 'WHAT COMES NEXT?',
        presentationContent: {
          type: 'text',
          value: `${seq[0]} → ${seq[1]} → ${seq[2]} → ?`,
        },
        options: allChoices,
        memorizeDurationMs: 0,
        actionTimeLimitMs: actDur,
        correctOptionIndex: allChoices.findIndex((c) => c.isCorrect),
      };
    } else {
      // IS THIS NUMBER EVEN OR ODD?
      const num = this.getRandomInt(11, 99);
      const isEven = num % 2 === 0;

      const choices: ChallengeOption[] = [
        { id: 'even', label: 'EVEN', isCorrect: isEven },
        { id: 'odd', label: 'ODD', isCorrect: !isEven },
      ];

      return {
        id: `logic_oddeven_${Date.now()}_${this.getRandom()}`,
        category: 'LOGIC',
        type: 'LOGIC_ODD_EVEN',
        instruction: 'NUMBER PROPERTY',
        question: `IS ${num} EVEN OR ODD?`,
        presentationContent: {
          type: 'number',
          value: num,
        },
        options: choices,
        memorizeDurationMs: 0,
        actionTimeLimitMs: Math.max(1300, actDur - 400),
        correctOptionIndex: isEven ? 0 : 1,
      };
    }
  }

  // --- 3. ATTENTION & OBSERVATION CHALLENGES ---
  private generateAttentionChallenge(round: number, memDur: number, actDur: number): Challenge {
    const subType = this.getRandomInt(0, 1);

    if (subType === 0) {
      // COUNT THE GREEN DOTS (3 to 7)
      const dotCount = this.getRandomInt(3, round < 8 ? 5 : 7);
      const wrong1 = dotCount + 1;
      const wrong2 = dotCount - 1;
      const wrong3 = dotCount + 2;

      const allChoices = this.shuffle([
        { id: 'c', label: dotCount.toString(), isCorrect: true },
        { id: 'w1', label: wrong1.toString(), isCorrect: false },
        { id: 'w2', label: wrong2.toString(), isCorrect: false },
        { id: 'w3', label: wrong3.toString(), isCorrect: false },
      ]).filter((c) => parseInt(c.label) > 0);

      return {
        id: `attn_dots_${Date.now()}_${this.getRandom()}`,
        category: 'ATTENTION',
        type: 'ATTN_COUNT_DOTS',
        instruction: 'COUNT THE GLOWING NODES',
        question: 'HOW MANY NODES?',
        presentationContent: {
          type: 'dots',
          value: dotCount,
        },
        options: allChoices,
        memorizeDurationMs: Math.max(1000, memDur + 300),
        actionTimeLimitMs: actDur,
        correctOptionIndex: allChoices.findIndex((c) => c.isCorrect),
      };
    } else {
      // FIND THE UNIQUE DIFFERENT SYMBOL
      const baseSym = SYMBOLS_POOL[this.getRandomInt(0, SYMBOLS_POOL.length - 1)];
      const diffSym = SYMBOLS_POOL.find((s) => s !== baseSym) || '★';

      const diffIndex = this.getRandomInt(0, 3);
      const symbolList = [baseSym, baseSym, baseSym, baseSym];
      symbolList[diffIndex] = diffSym;

      const choices: ChallengeOption[] = symbolList.map((sym, idx) => ({
        id: `s_${idx}`,
        label: `${idx + 1}`,
        subLabel: sym,
        isCorrect: idx === diffIndex,
      }));

      return {
        id: `attn_diff_${Date.now()}_${this.getRandom()}`,
        category: 'ATTENTION',
        type: 'ATTN_DIFFERENT_SYMBOL',
        instruction: 'SPOT THE DIFFERENT SYMBOL',
        question: 'WHICH POSITION IS DIFFERENT?',
        presentationContent: {
          type: 'symbols',
          value: symbolList,
        },
        options: choices,
        memorizeDurationMs: 0,
        actionTimeLimitMs: actDur,
        correctOptionIndex: diffIndex,
      };
    }
  }

  // --- 4. REACTION CHALLENGES ---
  private generateReactionChallenge(round: number, memDur: number, actDur: number): Challenge {
    const delay = this.getRandomInt(1100, 2200);

    return {
      id: `react_now_${Date.now()}_${this.getRandom()}`,
      category: 'REACTION',
      type: 'REACT_PRESS_NOW',
      instruction: 'PREPARE TO STRIKE',
      question: 'PRESS IMMEDIATELY WHEN GREEN!',
      presentationContent: {
        type: 'text',
        value: 'STAND BY...',
      },
      options: [
        { id: 'press', label: 'LOCK NOW!', isCorrect: true },
      ],
      memorizeDurationMs: delay, // Waiting period
      actionTimeLimitMs: Math.max(700, 1400 - round * 15), // Quick reaction window
      correctOptionIndex: 0,
    };
  }

  // --- 5. IMPULSE CONTROL CHALLENGES ---
  private generateImpulseChallenge(round: number, memDur: number, actDur: number): Challenge {
    // Player MUST NOT press. If they wait out the timer, they succeed!
    const waitTime = this.getRandomInt(1800, 2600);

    return {
      id: `impulse_wait_${Date.now()}_${this.getRandom()}`,
      category: 'IMPULSE',
      type: 'IMPULSE_WAIT',
      instruction: 'IMPULSE LOCK',
      question: 'DO NOT PRESS ANYTHING!',
      presentationContent: {
        type: 'text',
        value: 'HOLD...',
      },
      options: [
        { id: 'trap', label: 'PRESS ME', isCorrect: false },
      ],
      memorizeDurationMs: 0,
      actionTimeLimitMs: waitTime,
      correctOptionIndex: -1, // No option is correct, holding wins!
      isReactionWait: true,
    };
  }

  // --- 6. SEQUENCE CHALLENGES ---
  private generateSequenceChallenge(round: number, memDur: number, actDur: number): Challenge {
    const seqLength = round < 15 ? 3 : 4;
    const availableColors = ['GREEN', 'WHITE', 'LIME'];
    const chosenSeq: string[] = [];
    for (let i = 0; i < seqLength; i++) {
      chosenSeq.push(availableColors[this.getRandomInt(0, availableColors.length - 1)]);
    }

    const askIdx = this.getRandomInt(0, seqLength - 1);
    const ordinals = ['FIRST', 'SECOND', 'THIRD', 'FOURTH'];
    const correctVal = chosenSeq[askIdx];

    const choices: ChallengeOption[] = availableColors.map((col) => ({
      id: col,
      label: col,
      isCorrect: col === correctVal,
    }));

    return {
      id: `seq_${Date.now()}_${this.getRandom()}`,
      category: 'SEQUENCE',
      type: 'MEM_SEQUENCE',
      instruction: 'REMEMBER THE SEQUENCE',
      question: `WHAT WAS THE ${ordinals[askIdx]} COLOR?`,
      presentationContent: {
        type: 'text',
        value: chosenSeq.join('  →  '),
      },
      options: choices,
      memorizeDurationMs: memDur + 400,
      actionTimeLimitMs: actDur,
      correctOptionIndex: choices.findIndex((c) => c.isCorrect),
    };
  }

  // --- 7. COMPARISON CHALLENGES ---
  private generateComparisonChallenge(round: number, memDur: number, actDur: number): Challenge {
    const prev = this.lastNumberMemorized || this.getRandomInt(20, 80);
    const isHigher = this.getRandom() > 0.5;
    const offset = this.getRandomInt(3, 15);
    const current = isHigher ? prev + offset : Math.max(10, prev - offset);
    this.lastNumberMemorized = current;

    const choices: ChallengeOption[] = [
      { id: 'high', label: 'HIGHER', isCorrect: isHigher },
      { id: 'low', label: 'LOWER', isCorrect: !isHigher },
    ];

    return {
      id: `comp_${Date.now()}_${this.getRandom()}`,
      category: 'COMPARISON',
      type: 'COMP_HIGHER_LOWER',
      instruction: `PREVIOUS NUMBER: ${prev}`,
      question: `IS ${current} HIGHER OR LOWER?`,
      presentationContent: {
        type: 'text',
        value: `${current}`,
      },
      options: choices,
      memorizeDurationMs: 0,
      actionTimeLimitMs: Math.max(1400, actDur - 200),
      correctOptionIndex: isHigher ? 0 : 1,
    };
  }
}

export const challengeGen = new ChallengeGenerator();
