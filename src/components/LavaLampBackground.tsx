const blobs = [
  // Far background — large, very blurred, low opacity
  { size: 500, blur: 60, opacity: 0.10, x: '25%', y: '95%', move: '30s', morph: '28s', color: '14s', z: 1, delay: '0s' },
  { size: 450, blur: 50, opacity: 0.08, x: '65%', y: '100%', move: '34s', morph: '32s', color: '16s', z: 1, delay: '-8s' },

  // Mid-ground — medium, moderate blur, more defined
  { size: 350, blur: 12, opacity: 0.18, x: '45%', y: '90%', move: '24s', morph: '22s', color: '11s', z: 2, delay: '-3s' },
  { size: 300, blur: 10, opacity: 0.16, x: '20%', y: '105%', move: '27s', morph: '26s', color: '12s', z: 2, delay: '-12s' },
  { size: 280, blur: 15, opacity: 0.15, x: '75%', y: '88%', move: '22s', morph: '20s', color: '10s', z: 2, delay: '-6s' },

  // Foreground — sharp, high opacity, visible droplets
  { size: 220, blur: 2, opacity: 0.28, x: '30%', y: '98%', move: '20s', morph: '17s', color: '9s', z: 3, delay: '-2s' },
  { size: 180, blur: 0, opacity: 0.30, x: '55%', y: '92%', move: '18s', morph: '15s', color: '8s', z: 3, delay: '-7s' },
  { size: 160, blur: 3, opacity: 0.25, x: '18%', y: '102%', move: '22s', morph: '19s', color: '10s', z: 3, delay: '-4s' },
  { size: 200, blur: 4, opacity: 0.26, x: '80%', y: '96%', move: '19s', morph: '16s', color: '9s', z: 3, delay: '-10s' },
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
            zIndex: blob.z,
            animationDelay: blob.delay,
            '--rise-duration': blob.move,
            '--morph-duration': blob.morph,
            '--color-duration': blob.color,
          } as React.CSSProperties}
        />
      ))}
    </div>
  );
};

export default LavaLampBackground;
