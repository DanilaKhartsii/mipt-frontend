import '@testing-library/jest-dom';

// Clipboard API отсутствует в jsdom — задаём мок.
// configurable: true нужно чтобы userEvent.setup() мог переопределить clipboard в других тестах.
const clipboardWriteText = vi.fn().mockResolvedValue(undefined);
Object.defineProperty(globalThis.navigator, 'clipboard', {
  value: { writeText: clipboardWriteText },
  configurable: true,
  writable: true,
});

// Экспортируем мок — Message.test.tsx использует fireEvent (без pointer-событий),
// поэтому jsdom не переинициализирует clipboard и мок остаётся актуальным.
(globalThis as unknown as Record<string, unknown>).__clipboardWriteText = clipboardWriteText;