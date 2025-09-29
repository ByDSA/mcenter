import { createMockClass } from "$sharedTests/jest/mocking";
import { Job } from "bullmq";

export class MockJob extends createMockClass(Job) {
  constructor() {
    super();
    this.updateProgress.mockImplementation(()=>Promise.resolve());
    this.updateData.mockImplementation(()=>Promise.resolve());
  }
}
