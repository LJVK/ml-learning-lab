const STORAGE_KEY = "ml-learning-lab.completedConcepts";

export function getCompletedConcepts() {
  const rawValue = localStorage.getItem(STORAGE_KEY);

  if (!rawValue) {
    return [];
  }

  try {
    return JSON.parse(rawValue);
  } catch {
    return [];
  }
}

export function isConceptCompleted(conceptId) {
  return getCompletedConcepts().includes(conceptId);
}

export function markConceptCompleted(conceptId) {
  const completedConcepts = getCompletedConcepts();

  if (completedConcepts.includes(conceptId)) {
    return completedConcepts;
  }

  const updatedConcepts = [...completedConcepts, conceptId];

  localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedConcepts));

  return updatedConcepts;
}

export function getGroupProgress(group) {
  const completedConcepts = getCompletedConcepts();

  const completedCount = group.topics.filter((topic) =>
    completedConcepts.includes(topic.id)
  ).length;

  const status =
    completedCount === 0
      ? "Not Started"
      : completedCount === group.topics.length
        ? "Completed"
        : "In Progress";

  return {
    completedCount,
    totalCount: group.topics.length,
    isCompleted: completedCount === group.topics.length,
    status,
  };
}