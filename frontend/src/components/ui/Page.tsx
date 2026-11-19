import React from 'react';

interface PageFrameProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export const PageFrame: React.FC<PageFrameProps> = ({ children, className = '', ...props }) => (
  <div className={`page-frame ${className}`.trim()} {...props}>
    {children}
  </div>
);

interface PageHeaderProps {
  title: string;
  description?: string;
  icon?: React.ReactNode;
  before?: React.ReactNode;
  meta?: React.ReactNode;
  actions?: React.ReactNode;
}

export const PageHeader: React.FC<PageHeaderProps> = ({ title, description, icon, before, meta, actions }) => (
  <header className="page-header">
    <div className="page-header__content">
      {before}
      <div className="page-header__title-row">
        {icon && <span className="page-header__icon" aria-hidden="true">{icon}</span>}
        <h1 className="page-title">{title}</h1>
      </div>
      {description && <p className="page-description">{description}</p>}
      {meta && <div className="page-header__meta">{meta}</div>}
    </div>
    {actions && <div className="page-header__actions">{actions}</div>}
  </header>
);

interface SectionCardProps {
  title?: string;
  description?: string;
  actions?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

export const SectionCard: React.FC<SectionCardProps> = ({ title, description, actions, children, className = '' }) => (
  <section className={`section-card ${className}`.trim()}>
    {(title || description || actions) && (
      <div className="section-card__header">
        <div>
          {title && <h2 className="section-card__title">{title}</h2>}
          {description && <p className="section-card__description">{description}</p>}
        </div>
        {actions && <div className="section-card__actions">{actions}</div>}
      </div>
    )}
    {children}
  </section>
);

interface StatCardProps {
  icon?: React.ReactNode;
  value: React.ReactNode;
  label: string;
  description?: string;
  accent?: string;
  compact?: boolean;
  smallValue?: boolean;
}

export const StatCard: React.FC<StatCardProps> = ({ icon, value, label, description, accent = 'var(--cyan)', compact = false, smallValue = false }) => (
  <article className={`stat-card${compact ? ' stat-card--compact' : ''}${smallValue ? ' stat-card--small' : ''}`} style={{ '--stat-accent': accent } as React.CSSProperties}>
    {icon && <div className="stat-card__icon" aria-hidden="true">{icon}</div>}
    <div className="stat-card__content">
      <div className="stat-card__value">{value}</div>
      <div className="stat-card__label">{label}</div>
      {description && <div className="stat-card__description">{description}</div>}
    </div>
  </article>
);

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  icon?: React.ReactNode;
};

export const Button: React.FC<ButtonProps> = ({ children, className = '', variant = 'secondary', icon, ...props }) => (
  <button className={`ui-button ui-button--${variant} ${className}`.trim()} {...props}>
    {icon}
    {children}
  </button>
);
