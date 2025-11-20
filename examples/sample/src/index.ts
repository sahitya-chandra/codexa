export function greet(name: string): string {
  if (!name) {
    return 'Hello, Stranger!';
  }
  return `Hello, ${name}!`;
}

export function add(a: number, b: number): number {
  return a + b;
}

