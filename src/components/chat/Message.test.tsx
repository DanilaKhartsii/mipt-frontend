import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import Message from './Message';
import type { Message as MessageType } from '../../types';

vi.mock('react-markdown', () => ({
  default: ({ children }: { children: string }) => <span>{children}</span>,
}));

// Мок clipboard задан в setupTests.ts и защищён от перезаписи jsdom
const writeText = (globalThis as unknown as Record<string, ReturnType<typeof vi.fn>>)
  .__clipboardWriteText;

const userMessage: MessageType = {
  id: '1',
  role: 'user',
  content: 'Привет, мир!',
  timestamp: '12:00',
};

const assistantMessage: MessageType = {
  id: '2',
  role: 'assistant',
  content: 'Ответ ассистента',
  timestamp: '12:01',
};

beforeEach(() => {
  writeText?.mockClear();
});

describe('Message', () => {
  describe('variant="user"', () => {
    it('содержит текст сообщения', () => {
      render(<Message message={userMessage} variant="user" />);
      expect(screen.getByText('Привет, мир!')).toBeInTheDocument();
    });

    it('показывает имя отправителя «Вы»', () => {
      render(<Message message={userMessage} variant="user" />);
      expect(screen.getByText('Вы')).toBeInTheDocument();
    });

    it('корневой элемент имеет CSS-класс user', () => {
      const { container } = render(<Message message={userMessage} variant="user" />);
      expect(container.firstChild).toHaveClass('user');
    });

    it('кнопка «Копировать» отсутствует', () => {
      render(<Message message={userMessage} variant="user" />);
      expect(screen.queryByTitle('Копировать')).not.toBeInTheDocument();
    });
  });

  describe('variant="assistant"', () => {
    it('содержит текст сообщения', () => {
      render(<Message message={assistantMessage} variant="assistant" />);
      expect(screen.getByText('Ответ ассистента')).toBeInTheDocument();
    });

    it('показывает имя отправителя «GigaChat»', () => {
      render(<Message message={assistantMessage} variant="assistant" />);
      expect(screen.getByText('GigaChat')).toBeInTheDocument();
    });

    it('корневой элемент имеет CSS-класс assistant', () => {
      const { container } = render(<Message message={assistantMessage} variant="assistant" />);
      expect(container.firstChild).toHaveClass('assistant');
    });

    it('кнопка «Копировать» присутствует', () => {
      render(<Message message={assistantMessage} variant="assistant" />);
      expect(screen.getByTitle('Копировать')).toBeInTheDocument();
    });

    it('клик на «Копировать» вызывает clipboard.writeText с содержимым сообщения', () => {
      // fireEvent вместо userEvent: не генерирует pointer-события, исключая
      // ленивую инициализацию реального Clipboard API в jsdom
      render(<Message message={assistantMessage} variant="assistant" />);
      fireEvent.click(screen.getByTitle('Копировать'));
      expect(writeText).toHaveBeenCalledWith('Ответ ассистента');
    });
  });

  it('показывает временну́ю метку', () => {
    render(<Message message={userMessage} variant="user" />);
    expect(screen.getByText('12:00')).toBeInTheDocument();
  });
});