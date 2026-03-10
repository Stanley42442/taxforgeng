const blobs = [
  // Background — large, slow
  { size: 480, x: '30%', y: '90%', duration: '38s', drift: '42s', morph: '30s', color: '14s', delay: '0s' },
  { size: 420, x: '65%', y: '105%', duration: '44s', drift: '48s', morph: '34s', color: '16s', delay: '-10s' },

  // Mid-ground
  { size: 320, x: '50%', y: '95%', duration: '30s', drift: '34s', morph: '26s', color: '12s', delay: '-5s' },
  { size: 280, x: '22%', y: '100%', duration: '34s', drift: '38s', morph: '28s', color: '13s', delay: '-15s' },
  { size: 300, x: '72%', y: '88%', duration: '28s', drift: '32s', morph: '24s', color: '11s', delay: '-8s' },

  // Foreground — smaller, faster
  { size: 200, x: '35%', y: '98%', duration: '24s', drift: '28s', morph: '20s', color: '10s', delay: '-3s' },
  { size: 170, x: '58%', y: '92%', duration: '22s', drift: '26s', morph: '18s', color: '9s', delay: '-12s' },
  { size: 150, x: '18%', y: '102%', duration: '26s', drift: '30s', morph: '22s', color: '11s', delay: '-6s' },
  { size: 190, x: '80%', y: '96%', duration: '23s', drift: '27s', morph: '19s', color: '10s', delay: '-14s' },
];

export const LavaLampBackground = () => {
  return (
    <div
      className="fixed inset-0 z-0 pointer-events-none overflow-hidden"
      aria-hidden="true"
      style={{ filter: 'url(#lava-goo)' }}
    >
      <svg className="absolute" width="0" height="0">
        <defs>
          <filter id="lava-goo">
            <feGaussianBlur in="SourceGraphic" stdDeviation="18" result="blur" />
            <feColorMatrix
              in="blur"
              mode="matrix"
              values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 22 -9"
              result="goo"
            />
            <feComposite in="SourceGraphic" in2="goo" operator="atop" />
          </filter>
        </defs>
      </svg>
      {blobs.map((blob, i) => (
        <div
          key={i}
          className="absolute rounded-full lava-blob"
          style={{
            width: blob.size,
            height: blob.size,
            left: blob.x,
            top: blob.y,
            opacity: 0.35,
            animationDelay: blob.delay,
            '--rise-duration': blob.duration,
            '--drift-duration': blob.drift,
            '--morph-duration': blob.morph,
            '--color-duration': blob.color,
          } as React.CSSProperties}
        />
      ))}
    </div>
  );
};

export default LavaLampBackground;
