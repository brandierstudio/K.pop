import React, { useCallback, useEffect } from 'react';
import { LOOKS, PRODUCTS_MAP, findPerfumeVariantId, setProductImage } from './data/catalogData';
import {
  registerRunwayCustomElement,
  initBagDialogBindings,
  getBagController,
} from './utils/runwayElement';
import RailSection from './components/RailSection';
import PerfumeShowroom, { KP5_IMAGE_ASSETS, demoPerfumes } from './components/PerfumeShowroom.jsx';

for (const perfume of demoPerfumes) {
  const bottleImg = KP5_IMAGE_ASSETS[perfume.asset as keyof typeof KP5_IMAGE_ASSETS];
  if (bottleImg) {
    setProductImage(perfume.id, bottleImg);
  }
}

registerRunwayCustomElement();

const SECTION_ID = 'Runway-template--28035983671601__the_runway_wdM8BG';

const SECTION_INLINE_STYLE: React.CSSProperties = {
  '--rw-c-stage': '#fff9fc',
  '--rw-c-panel': '#ffffff',
  '--rw-c-text': '#14111f',
  '--rw-c-muted': '#695e7a',
  '--rw-c-accent': '#ff1f7a',
  '--rw-c-on-accent': '#ffffff',
  '--rw-c-line': '#f0d3e4',
  '--rw-card': '#DFDFDF',
  '--rw-hf': 'var(--font-heading--family, inherit)',
  '--rw-hw': '400',
  '--rw-h-d': '46px',
  '--rw-h-m': '24px',
  '--rw-sub-d': '12px',
  '--rw-sub-m': '12px',
  '--rw-eyebrow-d': '11px',
  '--rw-eyebrow-m': '10px',
  '--rw-label-d': '10px',
  '--rw-label-m': '9px',
  '--rw-chip-d': '17px',
  '--rw-chip-m': '18px',
  '--rw-ph-d': '18px',
  '--rw-ph-m': '16px',
  '--rw-pt-size-d': '13px',
  '--rw-pt-size-m': '12px',
  '--rw-price-d': '12px',
  '--rw-price-m': '12px',
  '--rw-opt-d': '11px',
  '--rw-opt-m': '11px',
  '--rw-total-d': '16px',
  '--rw-total-m': '16px',
  '--rw-thumb-d': '92px',
  '--rw-thumb-m': '62px',
  '--rw-tag-top': '18px',
  '--rw-tag-left': '0px',
  '--rw-thumb-radius': '0px',
  '--rw-morph': '900ms',
  '--rw-bar-r': '20px',
  '--rw-panel-w': '380px',
  '--rw-panel-pad-d': '32px',
  '--rw-radius': '0px',
  '--rw-max': 'none',
  '--rw-speed': '5s',
  '--rw-ax': '40%',
  '--rw-btn-radius': '0px',
  '--rw-pill-radius': '30px',
  '--rw-add-radius': '20px',
} as React.CSSProperties;

export default function App() {
  useEffect(() => {
    registerRunwayCustomElement();
    const cleanupBag = initBagDialogBindings();
    return () => {
      cleanupBag();
    };
  }, []);

  const handlePerfumeAddToCart = useCallback(
    (item: {
      id: string;
      sku: string;
      name: string;
      image: string;
      sizeMl: number;
      unitPrice: number;
      quantity?: number;
    }) => {
      const variantId = findPerfumeVariantId(item.id, item.sizeMl);
      if (variantId === null) {
        throw new Error(`Perfume variant not found: ${item.id} (${item.sizeMl} ml)`);
      }
      if (item.image) {
        setProductImage(item.id, item.image);
      }
      getBagController().add([{ id: variantId, quantity: item.quantity ?? 1 }], true, true);
    },
    []
  );

  return (
    <div className="site-shell">
      {/* 1.1 Site Header: Logo icon mark only (no text in header logo side), zero external links */}
      <header className="site-header shopify-section-group-header-group">
        <a href="#runway-home" className="brand" aria-label="Runway home">
          <img
            src="/assets/aistudio/kshop_pop_icon.png"
            width={68}
            height={34}
            alt="Logo"
          />
        </a>

        <nav aria-label="Main navigation">
          <a href="#runway-home" aria-current="page">
            Runway
          </a>
          <a href="#the-rail">The Rail</a>
          <a href="#the-rail">All Products</a>
          <a href="#site-footer">About</a>
        </nav>

        <button id="open-bag" type="button" aria-label="Open styling bag">
          <svg
            width={22}
            height={24}
            viewBox="0 0 24 26"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.5}
            aria-hidden="true"
          >
            <path d="M4 8h16l1 16H3L4 8zM8 8V6a4 4 0 0 1 8 0v2" />
          </svg>
          <span data-cart-count="">3</span>
        </button>
      </header>

      {/* Main Content: Section 1 (Runway Hero) + Section 2 (The Rail All Products Section) */}
      <main id="runway-home">
        {React.createElement(
          'runway-section',
          {
            id: SECTION_ID,
            className: 'rw rw--add-icon rw--popup rw--list has-dividers has-border',
            'data-feel': 'balanced',
            'data-blur': 'true',
            'data-mblur': 'true',
            'data-style': 'ring',
            'data-mstyle': 'classic',
            'data-fit': 'true',
            'data-height-mode': 'original',
            'data-height-vh': '100',
            'data-mheight-mode': 'custom',
            'data-mheight-vh': '109',
            'data-reflect': 'false',
            'data-autoplay': 'true',
            'data-speed': '5000',
            'data-after-add': 'stay',
            'data-bundle-code': '',
            'data-msg-choose': 'Pick a size for: [items]',
            'data-msg-error': 'Couldn’t add to bag. Please try again.',
            'data-msg-soldout': 'Sold out',
            style: SECTION_INLINE_STYLE,
          },
          <div className="rw__sticky">
            <div className="rw__grid">
              {/* Left column: Stage, Head, Controls, Lightbox */}
              <div className="rw__left">
                <div className="rw__head">
                  <div className="rw__intro">
                    <h2 className="rw__title">Try the Look.</h2>
                    <p className="rw__sub">
                      Six looks, styled head to toe. Tap a pin to see the piece.
                    </p>
                  </div>
                  <span
                    className="rw__sr"
                    aria-live="polite"
                    aria-atomic="true"
                    data-rw-live=""
                  />
                </div>

                {/* Stage */}
                <div
                  className="rw__stage"
                  data-rw-stage=""
                  tabIndex={0}
                  role="region"
                  aria-roledescription="carousel"
                  aria-label="Try the Look. — use arrow keys or swipe to change look"
                >
                  {/* Queue bodies 0..5 (script clones 6..11) */}
                  <div className="rw__actors" data-rw-actors="">
                    {LOOKS.map((look) => (
                      <div
                        key={`model-${look.index}`}
                        className="rw__model"
                        data-rw-model=""
                        data-index={String(look.index)}
                        aria-hidden="true"
                      >
                        <span className="rw__shadow" />
                        <div
                          className="rw__figure"
                          style={{ '--rw-ar': '0.5625' } as React.CSSProperties}
                        >
                          <div className="rw__art">
                            <img
                              src={look.model640}
                              srcSet={`${look.model640} 640w, ${look.model1080} 1080w`}
                              sizes="(min-width: 1800px) 540px, (min-width: 750px) 420px, 320px"
                              loading="eager"
                              decoding="async"
                              width={1100}
                              height={1956}
                              draggable={false}
                              data-model-image=""
                              alt={look.name}
                              referrerPolicy="no-referrer"
                            />
                            <button
                              type="button"
                              className="rw__hit"
                              data-rw-go={String(look.index)}
                              aria-label={`Look ${look.index + 1}: ${look.name}`}
                              tabIndex={-1}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Heroes 0..5 */}
                  <div className="rw__heroes" data-rw-heroes="">
                    {LOOKS.map((look) => (
                      <div
                        key={`hero-${look.index}`}
                        className={`rw__hero${look.index === 0 ? ' is-on' : ''}`}
                        data-rw-hero=""
                        data-index={String(look.index)}
                        data-name={look.name}
                        data-label={`Look ${look.index + 1}: ${look.name}`}
                        data-probe={look.model640}
                        aria-hidden={look.index === 0 ? 'false' : 'true'}
                      >
                        <div className="rw__morph">
                          <span className="rw__shadow" />
                          <div
                            className="rw__figure"
                            style={{ '--rw-ar': '0.5625' } as React.CSSProperties}
                          >
                            <div className="rw__art">
                              <img
                                src={look.model640}
                                srcSet={`${look.model640} 640w, ${look.model1080} 1080w`}
                                sizes="(min-width: 1800px) 540px, (min-width: 750px) 420px, 320px"
                                loading="eager"
                                decoding="async"
                                width={1100}
                                height={1956}
                                draggable={false}
                                data-model-image=""
                                alt={look.name}
                                referrerPolicy="no-referrer"
                              />
                              <button
                                type="button"
                                className="rw__zoom"
                                data-rw-zoom=""
                                aria-label={`View look: ${look.name}`}
                                tabIndex={look.index === 0 ? 0 : -1}
                              />
                              <div className="rw__pins">
                                {look.pins.map((pin) => (
                                  <button
                                    key={`pin-${look.index}-${pin.number}`}
                                    type="button"
                                    className="rw__pin"
                                    data-rw-pin={String(pin.number)}
                                    data-tip={pin.productName}
                                    style={
                                      {
                                        left: pin.left,
                                        top: pin.top,
                                        '--pi': pin.number,
                                      } as React.CSSProperties
                                    }
                                    aria-label={`${pin.number}: ${pin.productName}`}
                                    tabIndex={-1}
                                  >
                                    <span className="rw__pin-dot">{pin.number}</span>
                                  </button>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Light sweep */}
                  <span className="rw__sweep" />

                  {/* Custom cursor */}
                  <span className="rw__cursor" data-rw-cursor="">
                    <span className="rw__cursor-in">
                      <span className="rw__cursor-label rw__cursor-drag">Drag</span>
                      <span className="rw__cursor-label rw__cursor-view">View</span>
                    </span>
                  </span>

                  {/* Phone walk line */}
                  <span className="rw__walk">
                    <span className="rw__walk-line" />
                  </span>
                </div>

                {/* Controls row */}
                <div className="rw__controls">
                  <button
                    type="button"
                    className="rw__icon"
                    data-rw-prev=""
                    aria-label="Previous look"
                  >
                    <svg
                      width={26}
                      height={14}
                      viewBox="0 0 26 14"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={1.3}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                    >
                      <path d="M25 7H1M7 1L1 7l6 6" />
                    </svg>
                  </button>

                  <div className="rw__ticks">
                    {LOOKS.map((look) => (
                      <button
                        key={`tick-${look.index}`}
                        type="button"
                        className="rw__tick"
                        data-rw-tick={String(look.index)}
                        aria-current={look.index === 0 ? 'true' : 'false'}
                        aria-label={`Look ${look.index + 1}: ${look.name}`}
                      >
                        <span className="rw__tick-bar" />
                        <span className="rw__tick-label">
                          {look.numberFormatted}
                          <span className="rw__tick-name">
                            {'\u00A0\u00A0'}
                            {look.name}
                          </span>
                        </span>
                      </button>
                    ))}
                  </div>

                  <button
                    type="button"
                    className="rw__icon rw__auto"
                    data-rw-auto=""
                    aria-pressed="false"
                    aria-label="Autoplay"
                  >
                    <svg
                      className="rw__auto-play"
                      width={14}
                      height={14}
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      aria-hidden="true"
                    >
                      <path d="M7 4.5v15l12.5-7.5z" />
                    </svg>
                    <svg
                      className="rw__auto-pause"
                      width={14}
                      height={14}
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      aria-hidden="true"
                    >
                      <path d="M6.5 4.5h3.5v15H6.5zM14 4.5h3.5v15H14z" />
                    </svg>
                  </button>

                  <button
                    type="button"
                    className="rw__icon"
                    data-rw-next=""
                    aria-label="Next look"
                  >
                    <svg
                      width={26}
                      height={14}
                      viewBox="0 0 26 14"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={1.3}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                    >
                      <path d="M1 7h24M19 1l6 6-6 6" />
                    </svg>
                  </button>
                </div>

                {/* Lightbox ("View look" popup) */}
                <div
                  className="rw__lb"
                  data-rw-lb=""
                  data-word="Look"
                  role="region"
                  aria-label="View look"
                  aria-hidden="true"
                >
                  <div className="rw__lb-stage" data-rw-lb-stage="" />
                  <div className="rw__lb-top">
                    <p className="rw__lb-cap">
                      <span className="rw__lb-kicker" data-rw-lb-kicker="" />
                      <span className="rw__lb-name" data-rw-lb-name="" />
                    </p>
                    <button
                      type="button"
                      className="rw__lb-close"
                      data-rw-zoom-close=""
                      aria-label="Close"
                    >
                      <svg
                        width={16}
                        height={16}
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={1.5}
                        strokeLinecap="round"
                        aria-hidden="true"
                      >
                        <path d="M5 5l14 14M19 5L5 19" />
                      </svg>
                    </button>
                  </div>
                  <p className="rw__lb-hint">Tap a dot to shop the piece</p>
                </div>
              </div>

              {/* Right column: "In this look" Panel */}
              <div className="rw__panel has-rule">
                <div className="rw__panel-inner">
                  <div className="rw__panel-head">
                    <h3 className="rw__panel-title">In this look</h3>
                    <span className="rw__label" data-rw-pieces="">
                      3 pieces
                    </span>
                  </div>

                  {LOOKS.map((look) => (
                    <div
                      key={`panel-${look.index}`}
                      className={`rw__look-panel${look.index === 0 ? ' is-in' : ''}`}
                      data-rw-panel={String(look.index)}
                      hidden={look.index !== 0}
                    >
                      <div className="rw__mhead">
                        <span className="rw__mhead-title">{look.name}</span>
                        <span className="rw__label">{look.piecesLabel}</span>
                      </div>

                      <ul className="rw__items" role="list">
                        {look.items.map((itemCfg) => {
                          const product = PRODUCTS_MAP[itemCfg.productId];
                          if (!product) return null;
                          const pickerId = `Picker-template--28035983671601__the_runway_wdM8BG-look_${look.key}-${itemCfg.cardNumber}`;
                          const optName = `Opt-template--28035983671601__the_runway_wdM8BG-look_${look.key}-${itemCfg.cardNumber}-1`;

                          return (
                            <li
                              key={`${look.key}-${itemCfg.cardNumber}`}
                              className="rw__item"
                              data-rw-card={String(itemCfg.cardNumber)}
                              style={{ '--i': itemCfg.cardNumber } as React.CSSProperties}
                              data-title={product.name}
                            >
                              {itemCfg.tag && (
                                <span className="rw__tag">
                                  <span className="rw__tag-text">{itemCfg.tag}</span>
                                </span>
                              )}

                              <a
                                className="rw__media"
                                href={product.url}
                                tabIndex={-1}
                                aria-hidden="true"
                              >
                                <img
                                  src={product.image}
                                  loading="lazy"
                                  decoding="async"
                                  alt=""
                                  width={product.naturalWidth}
                                  height={product.naturalHeight}
                                  referrerPolicy="no-referrer"
                                />
                                <span className="rw__num">{itemCfg.cardNumber}</span>
                              </a>

                              <div className="rw__info">
                                <span className="rw__type">{product.vendor}</span>
                                <a className="rw__name" href={product.url}>
                                  {product.name}
                                </a>
                                <span className="rw__price">
                                  <span>{product.priceFormatted}</span>
                                </span>
                              </div>

                              <button
                                type="button"
                                className="rw__add"
                                data-rw-add=""
                                aria-expanded="false"
                                aria-controls={pickerId}
                                aria-label={`Add to bag: ${product.name}`}
                                data-added-label={`Added to bag: ${product.name}`}
                              >
                                <svg
                                  className="rw__add-plus"
                                  width={20}
                                  height={20}
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth={1.3}
                                  strokeLinecap="round"
                                  aria-hidden="true"
                                >
                                  <path d="M12 4v16M4 12h16" />
                                </svg>
                                <svg
                                  className="rw__add-check"
                                  width={20}
                                  height={20}
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth={1.5}
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  aria-hidden="true"
                                >
                                  <path d="M4.5 12.5l5 5L19.5 7" />
                                </svg>
                                <svg
                                  className="rw__add-spin"
                                  width={18}
                                  height={18}
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth={1.5}
                                  strokeLinecap="round"
                                  aria-hidden="true"
                                >
                                  <path d="M12 3a9 9 0 1 1-9 9" />
                                </svg>
                              </button>

                              {/* Size Picker */}
                              <div
                                id={pickerId}
                                className="rw__picker"
                                data-rw-picker=""
                                hidden
                              >
                                <div className="rw__picker-head">
                                  <img
                                    className="rw__picker-thumb"
                                    src={product.image}
                                    loading="lazy"
                                    decoding="async"
                                    alt=""
                                    width={160}
                                    height={product.sheetHeight}
                                    referrerPolicy="no-referrer"
                                  />
                                  <div className="rw__picker-meta">
                                    <span className="rw__picker-title">{product.name}</span>
                                    <span className="rw__picker-price">
                                      {product.priceFormatted}
                                    </span>
                                  </div>
                                  <button
                                    type="button"
                                    className="rw__picker-close"
                                    data-rw-pick-close=""
                                    aria-label="Close size picker"
                                  >
                                    <svg
                                      width={16}
                                      height={16}
                                      viewBox="0 0 24 24"
                                      fill="none"
                                      stroke="currentColor"
                                      strokeWidth={1.5}
                                      strokeLinecap="round"
                                      aria-hidden="true"
                                    >
                                      <path d="M5 5l14 14M19 5L5 19" />
                                    </svg>
                                  </button>
                                </div>

                                <fieldset className="rw__opt">
                                  <legend className="rw__opt-name">
                                    {product.optionLegend}
                                  </legend>
                                  <div className="rw__opt-vals">
                                    {product.sizes.map((sizeVal, sIdx) => (
                                      <label
                                        key={`${pickerId}-${sizeVal}`}
                                        className="rw__pill"
                                      >
                                        <input
                                          type="radio"
                                          name={optName}
                                          value={sizeVal}
                                          defaultChecked={sIdx === 0}
                                          data-rw-option="0"
                                        />
                                        <span className="rw__pill-label">{sizeVal}</span>
                                      </label>
                                    ))}
                                  </div>
                                </fieldset>

                                <button
                                  type="button"
                                  className="rw__confirm"
                                  data-rw-confirm=""
                                >
                                  <span data-rw-confirm-label="" data-add="Add to bag">
                                    Add to bag
                                  </span>
                                  <span className="rw__sr"> — {product.name}</span>
                                </button>

                                <script
                                  type="application/json"
                                  data-rw-variants=""
                                  dangerouslySetInnerHTML={{
                                    __html: JSON.stringify(product.variants),
                                  }}
                                />
                              </div>
                            </li>
                          );
                        })}
                      </ul>

                      <div className="rw__bundle has-rule">
                        <p
                          className="rw__msg"
                          data-rw-msg=""
                          role="status"
                          aria-live="polite"
                        />
                        <div className="rw__bundle-row">
                          <div className="rw__bundle-copy">
                            <span className="rw__bundle-title">Complete the look</span>
                            <span className="rw__bundle-note">
                              Bundle all 3 and save 10%
                            </span>
                          </div>
                          <div className="rw__bundle-price">
                            <s>{look.compareAtPrice}</s>
                            <strong>{look.bundlePrice}</strong>
                          </div>
                        </div>
                        <button type="button" className="rw__cta" data-rw-all="">
                          <span className="rw__cta-add">Add full look to bag</span>
                          <span className="rw__cta-m">
                            Add full look — {look.bundlePrice}
                          </span>
                          <span className="rw__cta-done">Full look in your bag</span>
                          <svg
                            className="rw__cta-arrow"
                            width={22}
                            height={12}
                            viewBox="0 0 26 14"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth={1.4}
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            aria-hidden="true"
                          >
                            <path d="M1 7h24M19 1l6 6-6 6" />
                          </svg>
                          <svg
                            className="rw__cta-spin"
                            width={16}
                            height={16}
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth={1.8}
                            strokeLinecap="round"
                            aria-hidden="true"
                          >
                            <path d="M12 3a9 9 0 1 1-9 9" />
                          </svg>
                        </button>
                      </div>

                      <template
                        data-rw-pieces-text=""
                        dangerouslySetInnerHTML={{ __html: look.piecesLabel }}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Section 2: "The Rail" — All Products Curved Rail Section */}
        <RailSection />

        {/* Section 3: "The Perfume Showroom" — Interactive 5-Bottle Scent Gallery */}
        <PerfumeShowroom
          onAddToCart={handlePerfumeAddToCart}
          bagTargetSelector="#open-bag"
        />
      </main>

      {/* Site Footer: Brand name "K.Shop Pop" mentioned exclusively here */}
      <footer id="site-footer" className="site-footer" aria-label="Site footer">
        <div className="site-footer__brand">
          <img
            src="/assets/aistudio/kshop_pop_icon.png"
            width={28}
            height={28}
            alt="K.Shop Pop icon"
          />
          <span className="site-footer__name">K.Shop Pop</span>
          <span aria-hidden="true">·</span>
          <span>Youthful Streetwear &amp; Tailored Rail Curation</span>
        </div>
        <div className="site-footer__links">
          <a href="#runway-home">Runway</a>
          <span aria-hidden="true">·</span>
          <a href="#the-rail">The Rail</a>
          <span aria-hidden="true">·</span>
          <span>© {new Date().getFullYear()} K.Shop Pop. All rights reserved.</span>
        </div>
      </footer>

      {/* Unified Slide-In Cart Drawer */}
      <button
        id="drawer-scrim"
        type="button"
        className="drawer-scrim"
        aria-label="Close cart drawer"
        tabIndex={-1}
      />
      <aside
        id="cart-drawer"
        className="drawer"
        aria-label="Shopping cart drawer"
        aria-hidden="true"
      >
        <div className="drawer-header">
          <div className="drawer-title-group">
            <h2>Cart</h2>
            <span className="drawer-count-chip" data-cart-count="">
              3
            </span>
          </div>
          <button
            id="close-bag"
            type="button"
            className="drawer-close-btn"
            aria-label="Close styling bag"
          >
            ×
          </button>
        </div>

        <div id="bag-items" className="drawer-items" />

        <div className="drawer-footer">
          <div className="drawer-total-row">
            <span>Estimated total</span>
            <strong id="bag-total">$2,070.00</strong>
          </div>
          <p className="drawer-tax-note">
            Taxes and shipping calculated at checkout.
          </p>
          <button id="checkout-bag" type="button" className="drawer-checkout-btn">
            Checkout
          </button>
          <button id="export-bag" type="button" className="drawer-export-btn">
            Download outfit shortlist
          </button>
        </div>
      </aside>

      {/* Toast status */}
      <div id="bag-status" role="status" aria-live="polite" />
    </div>
  );
}
