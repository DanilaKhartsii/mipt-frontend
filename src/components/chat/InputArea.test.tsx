import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import InputArea from './InputArea';

describe('InputArea', () => {
  it('кнопка «Отправить» заблокирована при пустом поле ввода', () => {
    render(<InputArea onSend={vi.fn()} />);
    expect(screen.getByTitle('Отправить')).toBeDisabled();
  });

  it('при непустом значении кнопка «Отправить» активна', async () => {
    const user = userEvent.setup();
    render(<InputArea onSend={vi.fn()} />);
    await user.type(screen.getByRole('textbox'), 'Привет');
    expect(screen.getByTitle('Отправить')).not.toBeDisabled();
  });

  it('при клике на кнопку «Отправить» вызывается onSend с текстом', async () => {
    const onSend = vi.fn();
    const user = userEvent.setup();
    render(<InputArea onSend={onSend} />);
    await user.type(screen.getByRole('textbox'), 'Привет, мир!');
    await user.click(screen.getByTitle('Отправить'));
    expect(onSend).toHaveBeenCalledWith('Привет, мир!');
  });

  it('после отправки поле ввода очищается', async () => {
    const user = userEvent.setup();
    render(<InputArea onSend={vi.fn()} />);
    const textarea = screen.getByRole('textbox');
    await user.type(textarea, 'Текст');
    await user.click(screen.getByTitle('Отправить'));
    expect(textarea).toHaveValue('');
  });

  it('при нажатии Enter с непустым вводом вызывается onSend', async () => {
    const onSend = vi.fn();
    const user = userEvent.setup();
    render(<InputArea onSend={onSend} />);
    await user.type(screen.getByRole('textbox'), 'Сообщение{Enter}');
    expect(onSend).toHaveBeenCalledWith('Сообщение');
  });

  it('Shift+Enter не отправляет сообщение', async () => {
    const onSend = vi.fn();
    const user = userEvent.setup();
    render(<InputArea onSend={onSend} />);
    await user.type(screen.getByRole('textbox'), 'Текст{Shift>}{Enter}{/Shift}');
    expect(onSend).not.toHaveBeenCalled();
  });

  it('onSend не вызывается при отправке пустой строки через Enter', async () => {
    const onSend = vi.fn();
    const user = userEvent.setup();
    render(<InputArea onSend={onSend} />);
    await user.type(screen.getByRole('textbox'), '{Enter}');
    expect(onSend).not.toHaveBeenCalled();
  });

  it('при isGenerating=true textarea заблокирована и показывается кнопка «Стоп»', () => {
    render(<InputArea onSend={vi.fn()} isGenerating onStop={vi.fn()} />);
    expect(screen.getByRole('textbox')).toBeDisabled();
    expect(screen.getByTitle('Остановить')).toBeInTheDocument();
  });
});