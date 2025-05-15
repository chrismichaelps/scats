/**
 * Vector examples demonstrating key features
 */
import { Vector } from "../dist";

// Function to test if Vector is exported properly
console.log("Vector exists:", typeof Vector !== "undefined");

// Test Vector functionality if it exists
if (typeof Vector !== "undefined") {
  console.log("\n=== Vector Examples ===");

  try {
    // Creating a Vector
    const vec = Vector.of(1, 2, 3, 4, 5);
    console.log("Vector.of(1, 2, 3, 4, 5):", vec.toArray());

    // Accessing elements (constant time)
    const third = vec.apply(2); // 3
    console.log("vec.apply(2):", third);

    const maybeValue = vec.get(10); // None (out of bounds)
    console.log("vec.get(10):", maybeValue);

    // Modifying elements
    const updated = vec.updated(2, 10); // Vector(1, 2, 10, 4, 5)
    console.log("vec.updated(2, 10):", updated.toArray());

    // Adding elements
    const appended = vec.appended(6); // Vector(1, 2, 3, 4, 5, 6)
    console.log("vec.appended(6):", appended.toArray());

    const prepended = vec.prepended(0); // Vector(0, 1, 2, 3, 4, 5)
    console.log("vec.prepended(0):", prepended.toArray());

    // Combining vectors
    const combined = vec.appendAll(Vector.of(6, 7, 8)); // Vector(1, 2, 3, 4, 5, 6, 7, 8)
    console.log("vec.appendAll(Vector.of(6, 7, 8)):", combined.toArray());

    // Transforming vectors
    const doubled = vec.map((n) => n * 2); // Vector(2, 4, 6, 8, 10)
    console.log("vec.map(n => n * 2):", doubled.toArray());

    const even = vec.filter((n) => n % 2 === 0); // Vector(2, 4)
    console.log("vec.filter(n => n % 2 === 0):", even.toArray());

    // Flattening
    const vectors = Vector.of(Vector.of(1, 2), Vector.of(3, 4));
    const flattened = vectors.flatMap((v) => v); // Vector(1, 2, 3, 4)
    console.log("vectors.flatMap(v => v):", flattened.toArray());

    // Static constructors
    const empty = Vector.empty(); // Empty vector
    console.log("Vector.empty():", empty.toArray());

    const fromArray = Vector.from([1, 2, 3]); // Vector from array
    console.log("Vector.from([1, 2, 3]):", fromArray.toArray());

    console.log("\nAll Vector examples completed successfully!");
  } catch (error) {
    console.error("Error in Vector examples:", error);
  }
}
