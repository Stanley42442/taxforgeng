const blobs = [
  // Far background — large, very blurred, low opacity
  { size: 320, blur: 60, opacity: 0.05, x: '10%', y: '20%', rise: '18s', drift: '25s', morph: '20s', color: '12s', delay: '0s' },
  { size: 280, blur: 50, opacity: 0.06, x: '75%', y: '65%', rise: '22s', drift: '28s', morph: '24s', color: '14s', delay: '-5s' },

  // Mid-ground — medium, moderate blur
  { size: 180, blur: 25, opacity: 0.08, x: '55%', y: '30%', rise: '16s', drift: '22s', morph: '18s', color: '10s', delay: '-3s' },
  { size: 160, blur: 20, opacity: 0.09, x: '25%', y: '70%', rise: '20s', drift: '26s', morph: '22s', color: '11s', delay: '-8s' },

  // Foreground — small, sharp, higher opacity
  { size: 100, blur: 4, opacity: 0.12, x: '40%', y: '15%', rise: '15s', drift: '20s', morph: '16s', color: '9s', delay: '-2s' },
  { size: 90, blur: 0, opacity: 0.14, x: '70%', y: '45%', rise: '17s', drift: '23s', morph: '14s', color: '8s', delay: '-6s' },
  { size: 80, blur: 3, opacity: 0.13, x: '15%', y: '50%', rise: '19s', drift: '21s', morph: '17s', color: '10s', delay: '-4s' },
];

export const LavaLampBackground = () => {
  return (
    <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden" aria-hidden="true">
      {blobs.map((blob, i) => (
        <div
          key={i}
          className="absolute rounded-full lava-blob"
          style={{
            width: blob.size,
            height: blob.size,
            left: blob.x,
            top: blob.y,
            filter: `blur(${blob.blur}px)`,
            opacity: blob.opacity,
            animationDelay: blob.delay,
            '--rise-duration': blob.rise,
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
