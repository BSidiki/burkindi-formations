export function Logo({ height = 56 }: { height?: number }) {
  return <img src="/brand/logo.png" alt="BURKINDI Formations" height={height} width={Math.round(height * 3.03)} style={{ height, width: 'auto' }} />;
}
export function Mark({ height = 38 }: { height?: number }) {
  return <img src="/brand/mark.png" alt="BURKINDI" height={height} width={Math.round(height * 1.27)} style={{ height, width: 'auto' }} />;
}
