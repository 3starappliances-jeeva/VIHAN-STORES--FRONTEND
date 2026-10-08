import type { ReactElement } from 'react';
import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { products } from '@/data/catalogue';
import { useCartStore } from '@/store/cart.store';
import { ProductCard } from './ProductCard';

const wrap = (ui: ReactElement) => render(<MemoryRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>{ui}</MemoryRouter>);

describe('ProductCard', () => {
  it('shows name, price, struck MRP and computed discount', () => {
    const ghee = products.find((p) => p.id === 'a2-ghee')!;
    wrap(<ProductCard product={ghee} />);
    expect(screen.getByRole('heading', { name: /A2 Bilona Ghee/ })).toBeInTheDocument();
    expect(screen.getByText('₹620')).toBeInTheDocument();
    expect(screen.getByText('₹690')).toBeInTheDocument();
    expect(screen.getByText('10% off')).toBeInTheDocument();
  });

  it('offers "Options" for multi-variant products and "Add" for single-size ones', async () => {
    const ragi = products.find((p) => p.id === 'ragi-malt')!;
    const rice = products.find((p) => p.id === 'black-rice')!;
    wrap(
      <>
        <ProductCard product={ragi} />
        <ProductCard product={rice} />
      </>,
    );
    expect(screen.getByRole('button', { name: /options: Sprouted Ragi Malt/i })).toBeInTheDocument();
    const add = screen.getByRole('button', { name: /^Add: Black Rice/i });
    await userEvent.click(add);
    expect(useCartStore.getState().lines).toHaveLength(1);
    expect(useCartStore.getState().lines[0].skuId).toBe('black-rice-1000');
  });
});
