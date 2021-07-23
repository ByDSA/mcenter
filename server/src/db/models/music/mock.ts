import { createFromPathAndSave, deleteAll } from ".";

export async function initializeMock() {
  await createFromPathAndSave("dk.mp3");
}

export async function clearMock() {
  await deleteAll();
}
