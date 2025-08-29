import { z } from "zod";
import { schemaToReadableFormat } from "./utils";

describe("schemaToReadableFormat", () => {
  it("should convert a simple schema to readable format", () => {
    const schema = z.object( {
      name: z.string(),
      age: z.number(),
      isActive: z.boolean(),
    } );
    const result = schemaToReadableFormat<typeof schema.shape>(schema);

    expect(result).toEqual( {
      name: {
        type: "string",
        required: true,
      },
      age: {
        type: "number",
        required: true,
      },
      isActive: {
        type: "boolean",
        required: true,
      },
    } );
  } );

  it("should handle optional fields", () => {
    const schema = z.object( {
      name: z.string(),
      age: z.number().optional(),
    } );
    const result = schemaToReadableFormat<typeof schema.shape>(schema);

    expect(result).toEqual( {
      name: {
        type: "string",
        required: true,
      },
      age: {
        type: "number",
        required: false,
      },
    } );
  } );

  it("should handle arrays", () => {
    const schema = z.object( {
      tags: z.array(z.string()),
      scores: z.array(z.number()).optional(),
    } );
    const result = schemaToReadableFormat<typeof schema.shape>(schema);

    expect(result).toEqual( {
      tags: {
        type: "string[]",
        required: true,
      },
      scores: {
        type: "number[]",
        required: false,
      },
    } );
  } );

  it("should handle ZodEffects (refinements)", () => {
    const schema = z.object( {
      email: z.string().email(),
      password: z.string().min(8),
    } );
    const result = schemaToReadableFormat<typeof schema.shape>(schema);

    expect(result).toEqual( {
      email: {
        type: "string",
        required: true,
      },
      password: {
        type: "string",
        required: true,
      },
    } );
  } );

  it("should handle nested objects", () => {
    const schema = z.object( {
      name: z.string(),
      timestamps: z.object( {
        createdAt: z.string(),
        updatedAt: z.string(),
      } ),
    } );
    const result = schemaToReadableFormat<typeof schema.shape>(schema);

    expect(result).toEqual( {
      name: {
        type: "string",
        required: true,
      },
      "timestamps.createdAt": {
        type: "string",
        required: true,
      },
      "timestamps.updatedAt": {
        type: "string",
        required: true,
      },
    } );
  } );

  it("should handle unknown types gracefully", () => {
    // Simulate a custom Zod type
    const customZodType: any = {
      _def: {
        typeName: "ZodCustomType",
      },
    };
    const schema = z.object( {
      custom: customZodType,
    } );
    const result = schemaToReadableFormat<typeof schema.shape>(schema);

    expect(result.custom.type).toBe("ZodCustomType");
    expect(typeof result.custom.required).toBe("boolean");
  } );
} );
