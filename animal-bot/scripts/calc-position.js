// Used to calculate the skip value for a picture.

class Foo {
  constructor() {
    this.limit = 5;
  }

  test(index) {
    this.index = index;

    const halfLimit = Math.ceil(this.limit / 2);

    const position = this.index % this.limit || this.limit;
    const skip = this.index > halfLimit ? this.index - halfLimit : this.index - position;
    return skip;
  }
}

const foo = new Foo();
                                // EXPECTED VALUES
console.log(foo.test(1)); // 0
console.log(foo.test(2)); // 0
console.log(foo.test(3)); // 0
console.log(foo.test(4)); // 1
console.log(foo.test(5)); // 2
console.log(foo.test(6)); // 3
console.log(foo.test(7)); // 4
console.log(foo.test(8)); // 5
console.log(foo.test(9)); // 6
console.log(foo.test(10)); // 7
console.log(foo.test(11)); // 8
console.log(foo.test(12)); // 9
console.log(foo.test(13)); // 10
