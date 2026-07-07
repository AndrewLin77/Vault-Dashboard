/** Show the curator's image or a letter fallback avatar. */
export default function CuratorAvatar({ name, image, className = '' }) {
  const classes = ['curator-avatar', className].filter(Boolean).join(' ');

  if (image) {
    return <img className={classes} src={image} alt="" />;
  }

  const initial = name?.charAt(0)?.toUpperCase() ?? '?';
  return <div className={`${classes} curator-avatar-fallback`}>{initial}</div>;
}
