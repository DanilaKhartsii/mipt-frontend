import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import Sidebar from './Sidebar';
import type { Chat } from '../../types';

const chats: Chat[] = [
  { id: '1', title: 'Первый чат', lastMessage: '', lastMessageDate: '' },
  { id: '2', title: 'Второй чат', lastMessage: '', lastMessageDate: '' },
  { id: '3', title: 'React вопросы', lastMessage: '', lastMessageDate: '' },
];

const defaultProps = {
  chats,
  activeChatId: '1',
  onSelectChat: vi.fn(),
  onNewChat: vi.fn(),
  onEditChat: vi.fn(),
  onDeleteChat: vi.fn(),
};

beforeEach(() => {
  vi.clearAllMocks();
});

describe('Sidebar', () => {
  describe('фильтрация чатов', () => {
    it('при пустом поисковом запросе отображаются все чаты', () => {
      render(<Sidebar {...defaultProps} />);
      expect(screen.getByText('Первый чат')).toBeInTheDocument();
      expect(screen.getByText('Второй чат')).toBeInTheDocument();
      expect(screen.getByText('React вопросы')).toBeInTheDocument();
    });

    it('при вводе текста список фильтруется по названию', async () => {
      const user = userEvent.setup();
      render(<Sidebar {...defaultProps} />);
      await user.type(screen.getByPlaceholderText('Поиск чатов...'), 'React');
      expect(screen.queryByText('Первый чат')).not.toBeInTheDocument();
      expect(screen.queryByText('Второй чат')).not.toBeInTheDocument();
      expect(screen.getByText('React вопросы')).toBeInTheDocument();
    });

    it('поиск регистронезависимый', async () => {
      const user = userEvent.setup();
      render(<Sidebar {...defaultProps} />);
      await user.type(screen.getByPlaceholderText('Поиск чатов...'), 'первый');
      expect(screen.getByText('Первый чат')).toBeInTheDocument();
      expect(screen.queryByText('Второй чат')).not.toBeInTheDocument();
    });

    it('при очистке поля поиска снова показываются все чаты', async () => {
      const user = userEvent.setup();
      render(<Sidebar {...defaultProps} />);
      const searchInput = screen.getByPlaceholderText('Поиск чатов...');
      await user.type(searchInput, 'React');
      await user.clear(searchInput);
      expect(screen.getByText('Первый чат')).toBeInTheDocument();
      expect(screen.getByText('Второй чат')).toBeInTheDocument();
      expect(screen.getByText('React вопросы')).toBeInTheDocument();
    });

    it('показывает «Чаты не найдены» если ничего не найдено', async () => {
      const user = userEvent.setup();
      render(<Sidebar {...defaultProps} />);
      await user.type(screen.getByPlaceholderText('Поиск чатов...'), 'несуществующий запрос xyz');
      expect(screen.getByText('Чаты не найдены')).toBeInTheDocument();
    });
  });

  describe('кнопка удаления', () => {
    it('при нажатии кнопки «Удалить» появляется запрос на подтверждение', () => {
      const confirmMock = vi.fn(() => true);
      window.confirm = confirmMock;
      render(<Sidebar {...defaultProps} />);
      fireEvent.mouseEnter(screen.getByText('Первый чат'));
      fireEvent.click(screen.getByTitle('Удалить'));
      expect(confirmMock).toHaveBeenCalled();
    });

    it('onDeleteChat вызывается при подтверждении удаления', () => {
      window.confirm = vi.fn(() => true);
      const onDeleteChat = vi.fn();
      render(<Sidebar {...defaultProps} onDeleteChat={onDeleteChat} />);
      fireEvent.mouseEnter(screen.getByText('Первый чат'));
      fireEvent.click(screen.getByTitle('Удалить'));
      expect(onDeleteChat).toHaveBeenCalledWith('1');
    });

    it('onDeleteChat не вызывается при отмене удаления', () => {
      window.confirm = vi.fn(() => false);
      const onDeleteChat = vi.fn();
      render(<Sidebar {...defaultProps} onDeleteChat={onDeleteChat} />);
      fireEvent.mouseEnter(screen.getByText('Первый чат'));
      fireEvent.click(screen.getByTitle('Удалить'));
      expect(onDeleteChat).not.toHaveBeenCalled();
    });
  });

  it('кнопка «+ Новый чат» вызывает onNewChat', async () => {
    const onNewChat = vi.fn();
    const user = userEvent.setup();
    render(<Sidebar {...defaultProps} onNewChat={onNewChat} />);
    await user.click(screen.getByText('+ Новый чат'));
    expect(onNewChat).toHaveBeenCalled();
  });
});