/**
 * LazyList examples demonstrating key features
 */
import { LazyList } from "../dist";

// Check if LazyList is exported
console.log("LazyList exists:", typeof LazyList !== "undefined");

if (typeof LazyList !== "undefined") {
  try {
    console.log("\n=== LazyList Examples ===");

    // Creating a LazyList
    const numbers = LazyList.of(1, 2, 3, 4, 5);
    console.log("LazyList.of(1, 2, 3, 4, 5):", numbers.toArray());

    // Creating an infinite sequence of numbers (using from with a single value and iterate)
    // LazyList.from(1) creates a single element LazyList with just the number 1
    const naturals = LazyList.from(1).iterate((n) => n + 1);

    // Taking only what you need
    const first10 = naturals.take(10).toArray(); // [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
    console.log("First 10 naturals:", first10);

    // Lazy transformation
    const evenSquares = naturals
      .filter((n) => n % 2 === 0) // Only even numbers
      .map((n) => n * n) // Square them
      .take(5) // Take first 5
      .toArray(); // [4, 16, 36, 64, 100]
    console.log("First 5 even squares:", evenSquares);

    // Generate a range of numbers
    const range = LazyList.range(1, 10); // 1 to 9
    console.log("Range 1-9:", range.toArray());

    // Create from iterable
    const fromArray = LazyList.from([1, 2, 3]);
    console.log("LazyList.from([1, 2, 3]):", fromArray.toArray());

    // Creating a stream with a generator function
    const randomNumbers = LazyList.continually(() => Math.random())
      .take(3)
      .toArray(); // Three random numbers
    console.log("Three random numbers:", randomNumbers);

    // Iterate from a seed value (using static method)
    const powers = LazyList.iterate(1, (n) => n * 2)
      .take(5)
      .toArray(); // [1, 2, 4, 8, 16]
    console.log("Powers of 2:", powers);

    console.log("\nAll LazyList examples completed successfully!");
  } catch (error) {
    console.error("Error in LazyList examples:", error);
  }
}
