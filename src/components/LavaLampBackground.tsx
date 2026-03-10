const blobs = [
  // Far background — large, very blurred, low opacity, start near bottom
  { size: 300, blur: 60, opacity: 0.06, x: '10%', y: '75%', rise: '28s', drift: '32s', morph: '26s', color: '14s', delay: '0s' },
  { size: 250, blur: 50, opacity: 0.07, x: '70%', y: '80%', rise: '32s', drift: '36s', morph: '30s', color: '16s', delay: '-8s' },

  // Mid-ground — medium, moderate blur
  { size: 160, blur: 25, opacity: 0.10, x: '50%', y: '70%', rise: '22s', drift: '26s', morph: '20s', color: '11s', delay: '-3s' },
  { size: 140, blur: 20, opacity: 0.11, x: '20%', y: '85%', rise: '25s', drift: '30s', morph: '24s', color: '12s', delay: '-12s' },
  { size: 120, blur: 18, opacity: 0.10, x: '80%', y: '65%', rise: '20s', drift: '24s', morph: '18s', color: '10s', delay: '-6s' },

  // Foreground — small, sharp, higher opacity (visible droplets)
  { size: 80, blur: 0, opacity: 0.20, x: '35%', y: '90%', rise: '18s', drift: '22s', morph: '15s', color: '9s', delay: '-2s' },
  { size: 60, blur: 0, opacity: 0.22, x: '65%', y: '85%', rise: '16s', drift: '20s', morph: '13s', color: '8s', delay: '-7s' },
  { size: 50, blur: 3, opacity: 0.18, x: '15%', y: '92%', rise: '20s', drift: '25s', morph: '17s', color: '10s', delay: '-4s' },
  { size: 70, blur: 2, opacity: 0.19, x: '85%', y: '88%', rise: '17s', drift: '21s', morph: '14s', color: '9s', delay: '-10s' },
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
