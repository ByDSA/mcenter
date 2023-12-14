import Repository from "../Repository";

const repository = new Repository();

export async function initializeMock() {
  await repository.createFromPathAndSave("dk.mp3");
}

export async function clearMock() {
  await repository.deleteAll();
}
