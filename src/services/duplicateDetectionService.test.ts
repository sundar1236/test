import { describe, it, expect } from 'vitest';
import { normalizeQuestionText } from './duplicateDetectionService';

describe('normalizeQuestionText', () => {
  it('returns empty string for empty or falsy inputs', () => {
    expect(normalizeQuestionText('')).toBe('');
    // @ts-expect-error testing runtime falsy value
    expect(normalizeQuestionText(null)).toBe('');
    // @ts-expect-error testing runtime falsy value
    expect(normalizeQuestionText(undefined)).toBe('');
  });

  it('converts text to lowercase', () => {
    expect(normalizeQuestionText('WHAT IS THE CAPITAL OF FRANCE?')).toBe('what is the capital of france');
    expect(normalizeQuestionText('MixedCASE Text')).toBe('mixedcase text');
  });

  it('strips HTML tags completely', () => {
    expect(normalizeQuestionText('<p>What is <strong>2 + 2</strong>?</p>')).toBe('what is 2 2');
    expect(normalizeQuestionText('<span>Select the <br/> correct answer:</span>')).toBe('select the correct answer');
    expect(normalizeQuestionText('<div class="question"><p>Question 1</p></div>')).toBe('question 1');
  });

  it('replaces punctuation and special symbols with spaces', () => {
    expect(normalizeQuestionText('Hello, world! How are you?')).toBe('hello world how are you');
    expect(normalizeQuestionText('Price: $100 & #50 @ 10%')).toBe('price 100 50 10');
    expect(normalizeQuestionText('foo-bar_baz.qux')).toBe('foo bar_baz qux'); // \w includes underscore (_)
  });

  it('collapses multiple whitespace characters and trims leading/trailing space', () => {
    expect(normalizeQuestionText('   too    many   spaces   ')).toBe('too many spaces');
    expect(normalizeQuestionText("line1\nline2\tline3\r\nline4")).toBe('line1 line2 line3 line4');
  });

  it('preserves alphanumeric characters and numbers', () => {
    expect(normalizeQuestionText('In 2024, option A is 100% correct.')).toBe('in 2024 option a is 100 correct');
  });

  it('handles complex combined edge cases with HTML, punctuation, mixed casing, and whitespace', () => {
    const input = '  <p style="color:red">WHAT is the value of <b>X</b>, if <i>X + 5 = 10</i>?  </p>  ';
    const expected = 'what is the value of x if x 5 10';
    expect(normalizeQuestionText(input)).toBe(expected);
  });
});
