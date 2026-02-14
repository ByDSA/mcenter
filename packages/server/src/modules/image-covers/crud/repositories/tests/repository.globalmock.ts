import { createMockClass } from "$sharedTests/jest/mocking";
import { Types } from "mongoose";
import { ImageCoverEntity } from "$shared/models/image-covers";
import { registerMockProviderInstance } from "#utils/nestjs/tests";
import { ImageCoversRepository } from "../repository";

const SAMPLE_IMAGE_COVER = {
  id: new Types.ObjectId().toString(),
  metadata: {
    label: "test-image",
  },
  versions: {
    original: "/path/to/original.jpg",
    large: "/path/to/large.jpg",
    medium: "/path/to/medium.jpg",
    small: "/path/to/small.jpg",
  },
  uploaderUserId: new Types.ObjectId().toString(),
  createdAt: new Date(),
  updatedAt: new Date(),
} satisfies ImageCoverEntity;

class ImageCoversRepositoryMock extends createMockClass(ImageCoversRepository) {
  constructor() {
    super();

    this.getMany.mockResolvedValue([SAMPLE_IMAGE_COVER]);

    this.getOne.mockResolvedValue(SAMPLE_IMAGE_COVER);

    this.getOneById.mockResolvedValue(SAMPLE_IMAGE_COVER);

    this.getAll.mockResolvedValue([SAMPLE_IMAGE_COVER]);

    this.getManyBySearchLabel.mockResolvedValue([SAMPLE_IMAGE_COVER]);

    this.patchOneByIdAndGet.mockResolvedValue( {
      ...SAMPLE_IMAGE_COVER,
      updatedAt: new Date(),
    } );

    this.deleteOneByIdAndGet.mockResolvedValue(SAMPLE_IMAGE_COVER);

    this.createOneAndGet.mockImplementation((createDto) => Promise.resolve( {
      ...createDto,
      id: new Types.ObjectId().toString(),
      createdAt: new Date(),
      updatedAt: new Date(),
    } ));
  }
}

registerMockProviderInstance(ImageCoversRepository, new ImageCoversRepositoryMock());
