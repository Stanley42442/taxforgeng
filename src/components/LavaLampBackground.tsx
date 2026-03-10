const blobs = [
  // Far background — large, very blurred, low opacity
  { size: 500, blur: 60, opacity: 0.10, x: '25%', y: '95%', rise: '30s', drift: '34s', morph: '28s', color: '14s', z: 1, zDur: '40s', delay: '0s' },
  { size: 450, blur: 50, opacity: 0.08, x: '65%', y: '100%', rise: '34s', drift: '38s', morph: '32s', color: '16s', z: 1, zDur: '44s', delay: '-8s' },

  // Mid-ground — medium, moderate blur, more defined
  { size: 350, blur: 12, opacity: 0.18, x: '45%', y: '90%', rise: '24s', drift: '28s', morph: '22s', color: '11s', z: 2, zDur: '28s', delay: '-3s' },
  { size: 300, blur: 10, opacity: 0.16, x: '20%', y: '105%', rise: '27s', drift: '32s', morph: '26s', color: '12s', z: 2, zDur: '32s', delay: '-12s' },
  { size: 280, blur: 15, opacity: 0.15, x: '75%', y: '88%', rise: '22s', drift: '26s', morph: '20s', color: '10s', z: 2, zDur: '30s', delay: '-6s' },

  // Foreground — sharp, high opacity, visible droplets
  { size: 220, blur: 2, opacity: 0.28, x: '30%', y: '98%', rise: '20s', drift: '24s', morph: '17s', color: '9s', z: 3, zDur: '20s', delay: '-2s' },
  { size: 180, blur: 0, opacity: 0.30, x: '55%', y: '92%', rise: '18s', drift: '22s', morph: '15s', color: '8s', z: 3, zDur: '18s', delay: '-7s' },
  { size: 160, blur: 3, opacity: 0.25, x: '18%', y: '102%', rise: '22s', drift: '27s', morph: '19s', color: '10s', z: 3, zDur: '22s', delay: '-4s' },
  { size: 200, blur: 4, opacity: 0.26, x: '80%', y: '96%', rise: '19s', drift: '23s', morph: '16s', color: '9s', z: 3, zDur: '24s', delay: '-10s' },
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
            '--rise-duration': blob.rise,
            '--drift-duration': blob.drift,
            '--morph-duration': blob.morph,
            '--color-duration': blob.color,
            '--z-duration': blob.zDur,
          } as React.CSSProperties}
        />
      ))}
    </div>
  );
};

export default LavaLampBackground;
