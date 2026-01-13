import { collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
import { db } from '../firebase/config';
import type { Harvest } from '../types';

/**
 * Record categories for club records
 */
export type RecordCategory =
  | 'biggest-buck-score'
  | 'biggest-buck-points'
  | 'biggest-buck-spread'
  | 'heaviest-deer'
  | 'heaviest-buck'
  | 'heaviest-doe'
  | 'biggest-turkey-beard'
  | 'biggest-turkey-spurs'
  | 'heaviest-turkey'
  | 'biggest-hog'
  | 'first-harvest'
  | 'most-harvests-season';

export interface ClubRecord {
  category: RecordCategory;
  title: string;
  description: string;
  harvest: Harvest;
  value: number;  // The measurement that makes this a record
  unit: string;   // "inches", "lbs", "points", etc.
}

/**
 * Get club records across all categories
 */
export async function getClubRecords(clubId: string): Promise<ClubRecord[]> {
  const records: ClubRecord[] = [];

  // Get all harvests for this club
  const harvestsQuery = query(
    collection(db, 'harvests'),
    where('clubId', '==', clubId)
  );

  const snapshot = await getDocs(harvestsQuery);
  const harvests = snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  } as Harvest));

  if (harvests.length === 0) {
    return [];
  }

  // Deer records
  const deerHarvests = harvests.filter(h => h.species === 'deer');

  if (deerHarvests.length > 0) {
    // Biggest Buck by Score
    const bucksByScore = deerHarvests
      .filter(h => h.sex === 'male' && h.deerData?.grossScore)
      .sort((a, b) => (b.deerData?.grossScore || 0) - (a.deerData?.grossScore || 0));

    if (bucksByScore.length > 0 && bucksByScore[0].deerData?.grossScore) {
      records.push({
        category: 'biggest-buck-score',
        title: 'Biggest Buck (Score)',
        description: 'Highest gross B&C/P&Y score',
        harvest: bucksByScore[0],
        value: bucksByScore[0].deerData.grossScore,
        unit: 'inches'
      });
    }

    // Biggest Buck by Points
    const bucksByPoints = deerHarvests
      .filter(h => h.sex === 'male' && h.deerData?.points)
      .sort((a, b) => (b.deerData?.points || 0) - (a.deerData?.points || 0));

    if (bucksByPoints.length > 0 && bucksByPoints[0].deerData?.points) {
      records.push({
        category: 'biggest-buck-points',
        title: 'Most Points',
        description: 'Buck with most antler points',
        harvest: bucksByPoints[0],
        value: bucksByPoints[0].deerData.points,
        unit: 'points'
      });
    }

    // Biggest Buck by Spread
    const bucksBySpread = deerHarvests
      .filter(h => h.sex === 'male' && h.deerData?.spread)
      .sort((a, b) => (b.deerData?.spread || 0) - (a.deerData?.spread || 0));

    if (bucksBySpread.length > 0 && bucksBySpread[0].deerData?.spread) {
      records.push({
        category: 'biggest-buck-spread',
        title: 'Widest Spread',
        description: 'Widest inside spread',
        harvest: bucksBySpread[0],
        value: bucksBySpread[0].deerData.spread,
        unit: 'inches'
      });
    }

    // Heaviest Deer (any sex)
    const heaviestDeer = deerHarvests
      .filter(h => h.weight)
      .sort((a, b) => (b.weight || 0) - (a.weight || 0));

    if (heaviestDeer.length > 0 && heaviestDeer[0].weight) {
      records.push({
        category: 'heaviest-deer',
        title: 'Heaviest Deer',
        description: 'Heaviest live weight deer',
        harvest: heaviestDeer[0],
        value: heaviestDeer[0].weight,
        unit: 'lbs'
      });
    }

    // Heaviest Buck
    const heaviestBuck = deerHarvests
      .filter(h => h.sex === 'male' && h.weight)
      .sort((a, b) => (b.weight || 0) - (a.weight || 0));

    if (heaviestBuck.length > 0 && heaviestBuck[0].weight) {
      records.push({
        category: 'heaviest-buck',
        title: 'Heaviest Buck',
        description: 'Heaviest live weight buck',
        harvest: heaviestBuck[0],
        value: heaviestBuck[0].weight,
        unit: 'lbs'
      });
    }

    // Heaviest Doe
    const heaviestDoe = deerHarvests
      .filter(h => h.sex === 'female' && h.weight)
      .sort((a, b) => (b.weight || 0) - (a.weight || 0));

    if (heaviestDoe.length > 0 && heaviestDoe[0].weight) {
      records.push({
        category: 'heaviest-doe',
        title: 'Heaviest Doe',
        description: 'Heaviest live weight doe',
        harvest: heaviestDoe[0],
        value: heaviestDoe[0].weight,
        unit: 'lbs'
      });
    }
  }

  // Turkey records
  const turkeyHarvests = harvests.filter(h => h.species === 'turkey');

  if (turkeyHarvests.length > 0) {
    // Biggest Beard
    const biggestBeard = turkeyHarvests
      .filter(h => h.turkeyData?.beardLength)
      .sort((a, b) => (b.turkeyData?.beardLength || 0) - (a.turkeyData?.beardLength || 0));

    if (biggestBeard.length > 0 && biggestBeard[0].turkeyData?.beardLength) {
      records.push({
        category: 'biggest-turkey-beard',
        title: 'Longest Beard',
        description: 'Longest turkey beard',
        harvest: biggestBeard[0],
        value: biggestBeard[0].turkeyData.beardLength,
        unit: 'inches'
      });
    }

    // Longest Spurs
    const longestSpurs = turkeyHarvests
      .filter(h => h.turkeyData?.spurLength)
      .sort((a, b) => (b.turkeyData?.spurLength || 0) - (a.turkeyData?.spurLength || 0));

    if (longestSpurs.length > 0 && longestSpurs[0].turkeyData?.spurLength) {
      records.push({
        category: 'biggest-turkey-spurs',
        title: 'Longest Spurs',
        description: 'Longest turkey spurs',
        harvest: longestSpurs[0],
        value: longestSpurs[0].turkeyData.spurLength,
        unit: 'inches'
      });
    }

    // Heaviest Turkey
    const heaviestTurkey = turkeyHarvests
      .filter(h => h.turkeyData?.weight)
      .sort((a, b) => (b.turkeyData?.weight || 0) - (a.turkeyData?.weight || 0));

    if (heaviestTurkey.length > 0 && heaviestTurkey[0].turkeyData?.weight) {
      records.push({
        category: 'heaviest-turkey',
        title: 'Heaviest Turkey',
        description: 'Heaviest turkey',
        harvest: heaviestTurkey[0],
        value: heaviestTurkey[0].turkeyData.weight,
        unit: 'lbs'
      });
    }
  }

  // Hog records
  const hogHarvests = harvests.filter(h => h.species === 'hog');

  if (hogHarvests.length > 0) {
    const biggestHog = hogHarvests
      .filter(h => h.weight)
      .sort((a, b) => (b.weight || 0) - (a.weight || 0));

    if (biggestHog.length > 0 && biggestHog[0].weight) {
      records.push({
        category: 'biggest-hog',
        title: 'Biggest Hog',
        description: 'Heaviest hog',
        harvest: biggestHog[0],
        value: biggestHog[0].weight,
        unit: 'lbs'
      });
    }
  }

  return records;
}

/**
 * Get leaderboard for a specific measurement
 */
export async function getLeaderboard(
  clubId: string,
  category: RecordCategory,
  limitCount: number = 10
): Promise<{ harvest: Harvest; value: number; unit: string; rank: number }[]> {

  const harvestsQuery = query(
    collection(db, 'harvests'),
    where('clubId', '==', clubId)
  );

  const snapshot = await getDocs(harvestsQuery);
  const harvests = snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  } as Harvest));

  let sortedHarvests: { harvest: Harvest; value: number; unit: string }[] = [];

  switch (category) {
    case 'biggest-buck-score':
      sortedHarvests = harvests
        .filter(h => h.species === 'deer' && h.sex === 'male' && h.deerData?.grossScore)
        .map(h => ({ harvest: h, value: h.deerData!.grossScore!, unit: 'inches' }))
        .sort((a, b) => b.value - a.value);
      break;

    case 'biggest-buck-points':
      sortedHarvests = harvests
        .filter(h => h.species === 'deer' && h.sex === 'male' && h.deerData?.points)
        .map(h => ({ harvest: h, value: h.deerData!.points!, unit: 'points' }))
        .sort((a, b) => b.value - a.value);
      break;

    case 'biggest-buck-spread':
      sortedHarvests = harvests
        .filter(h => h.species === 'deer' && h.sex === 'male' && h.deerData?.spread)
        .map(h => ({ harvest: h, value: h.deerData!.spread!, unit: 'inches' }))
        .sort((a, b) => b.value - a.value);
      break;

    case 'heaviest-deer':
      sortedHarvests = harvests
        .filter(h => h.species === 'deer' && h.weight)
        .map(h => ({ harvest: h, value: h.weight!, unit: 'lbs' }))
        .sort((a, b) => b.value - a.value);
      break;

    case 'heaviest-buck':
      sortedHarvests = harvests
        .filter(h => h.species === 'deer' && h.sex === 'male' && h.weight)
        .map(h => ({ harvest: h, value: h.weight!, unit: 'lbs' }))
        .sort((a, b) => b.value - a.value);
      break;

    case 'heaviest-doe':
      sortedHarvests = harvests
        .filter(h => h.species === 'deer' && h.sex === 'female' && h.weight)
        .map(h => ({ harvest: h, value: h.weight!, unit: 'lbs' }))
        .sort((a, b) => b.value - a.value);
      break;

    case 'biggest-turkey-beard':
      sortedHarvests = harvests
        .filter(h => h.species === 'turkey' && h.turkeyData?.beardLength)
        .map(h => ({ harvest: h, value: h.turkeyData!.beardLength!, unit: 'inches' }))
        .sort((a, b) => b.value - a.value);
      break;

    case 'biggest-turkey-spurs':
      sortedHarvests = harvests
        .filter(h => h.species === 'turkey' && h.turkeyData?.spurLength)
        .map(h => ({ harvest: h, value: h.turkeyData!.spurLength!, unit: 'inches' }))
        .sort((a, b) => b.value - a.value);
      break;

    case 'heaviest-turkey':
      sortedHarvests = harvests
        .filter(h => h.species === 'turkey' && h.turkeyData?.weight)
        .map(h => ({ harvest: h, value: h.turkeyData!.weight!, unit: 'lbs' }))
        .sort((a, b) => b.value - a.value);
      break;

    case 'biggest-hog':
      sortedHarvests = harvests
        .filter(h => h.species === 'hog' && h.weight)
        .map(h => ({ harvest: h, value: h.weight!, unit: 'lbs' }))
        .sort((a, b) => b.value - a.value);
      break;
  }

  // Limit results and add rank
  return sortedHarvests.slice(0, limitCount).map((item, index) => ({
    ...item,
    rank: index + 1
  }));
}

/**
 * Get harvest statistics for a club
 */
export async function getHarvestStats(clubId: string, season?: string) {
  const harvestsQuery = query(
    collection(db, 'harvests'),
    where('clubId', '==', clubId)
  );

  const snapshot = await getDocs(harvestsQuery);
  let harvests = snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  } as Harvest));

  // Filter by season if provided (year)
  if (season) {
    harvests = harvests.filter(h => h.date.startsWith(season));
  }

  const stats = {
    total: harvests.length,
    bySpecies: {
      deer: harvests.filter(h => h.species === 'deer').length,
      turkey: harvests.filter(h => h.species === 'turkey').length,
      hog: harvests.filter(h => h.species === 'hog').length,
      other: harvests.filter(h => h.species === 'other').length
    },
    bySex: {
      male: harvests.filter(h => h.sex === 'male').length,
      female: harvests.filter(h => h.sex === 'female').length,
      unknown: harvests.filter(h => !h.sex).length
    },
    byWeapon: {
      rifle: harvests.filter(h => h.weaponType === 'rifle').length,
      bow: harvests.filter(h => h.weaponType === 'bow').length,
      crossbow: harvests.filter(h => h.weaponType === 'crossbow').length,
      muzzleloader: harvests.filter(h => h.weaponType === 'muzzleloader').length,
      shotgun: harvests.filter(h => h.weaponType === 'shotgun').length,
      unknown: harvests.filter(h => !h.weaponType).length
    },
    averageWeight: {
      deer: calculateAverage(
        harvests.filter(h => h.species === 'deer' && h.weight).map(h => h.weight!)
      ),
      buck: calculateAverage(
        harvests.filter(h => h.species === 'deer' && h.sex === 'male' && h.weight).map(h => h.weight!)
      ),
      doe: calculateAverage(
        harvests.filter(h => h.species === 'deer' && h.sex === 'female' && h.weight).map(h => h.weight!)
      )
    },
    topHunters: getTopHunters(harvests),
    harvestsByMonth: getHarvestsByMonth(harvests)
  };

  return stats;
}

/**
 * Calculate average of number array
 */
function calculateAverage(numbers: number[]): number {
  if (numbers.length === 0) return 0;
  const sum = numbers.reduce((a, b) => a + b, 0);
  return Math.round((sum / numbers.length) * 10) / 10; // Round to 1 decimal
}

/**
 * Get top hunters by harvest count
 */
function getTopHunters(harvests: Harvest[]): { userId: string; userName: string; count: number }[] {
  const hunterCounts = new Map<string, { userName: string; count: number }>();

  harvests.forEach(h => {
    const current = hunterCounts.get(h.userId) || { userName: h.userName, count: 0 };
    current.count++;
    hunterCounts.set(h.userId, current);
  });

  return Array.from(hunterCounts.entries())
    .map(([userId, data]) => ({ userId, userName: data.userName, count: data.count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);
}

/**
 * Get harvests by month
 */
function getHarvestsByMonth(harvests: Harvest[]): { month: string; count: number }[] {
  const monthCounts = new Map<string, number>();

  harvests.forEach(h => {
    const date = new Date(h.date);
    const monthKey = date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
    monthCounts.set(monthKey, (monthCounts.get(monthKey) || 0) + 1);
  });

  return Array.from(monthCounts.entries())
    .map(([month, count]) => ({ month, count }))
    .sort((a, b) => a.month.localeCompare(b.month));
}

/**
 * Check if harvest qualifies for a club record
 */
export async function checkForNewRecord(
  clubId: string,
  harvest: Harvest
): Promise<{ isRecord: boolean; categories: RecordCategory[] }> {
  const currentRecords = await getClubRecords(clubId);
  const newRecordCategories: RecordCategory[] = [];

  // Check deer records
  if (harvest.species === 'deer' && harvest.sex === 'male') {
    // Score
    if (harvest.deerData?.grossScore) {
      const currentScoreRecord = currentRecords.find(r => r.category === 'biggest-buck-score');
      if (!currentScoreRecord || harvest.deerData.grossScore > currentScoreRecord.value) {
        newRecordCategories.push('biggest-buck-score');
      }
    }

    // Points
    if (harvest.deerData?.points) {
      const currentPointsRecord = currentRecords.find(r => r.category === 'biggest-buck-points');
      if (!currentPointsRecord || harvest.deerData.points > currentPointsRecord.value) {
        newRecordCategories.push('biggest-buck-points');
      }
    }

    // Spread
    if (harvest.deerData?.spread) {
      const currentSpreadRecord = currentRecords.find(r => r.category === 'biggest-buck-spread');
      if (!currentSpreadRecord || harvest.deerData.spread > currentSpreadRecord.value) {
        newRecordCategories.push('biggest-buck-spread');
      }
    }

    // Weight
    if (harvest.weight) {
      const currentWeightRecord = currentRecords.find(r => r.category === 'heaviest-buck');
      if (!currentWeightRecord || harvest.weight > currentWeightRecord.value) {
        newRecordCategories.push('heaviest-buck');
      }
    }
  }

  // Check turkey records
  if (harvest.species === 'turkey') {
    if (harvest.turkeyData?.beardLength) {
      const currentBeardRecord = currentRecords.find(r => r.category === 'biggest-turkey-beard');
      if (!currentBeardRecord || harvest.turkeyData.beardLength > currentBeardRecord.value) {
        newRecordCategories.push('biggest-turkey-beard');
      }
    }
  }

  return {
    isRecord: newRecordCategories.length > 0,
    categories: newRecordCategories
  };
}
