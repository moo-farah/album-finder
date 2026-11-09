const AlbumSkeleton = () => {
  return (
    <article className="album-card skeleton" aria-hidden="true">
      <div className="album-cover-fallback" />
      <div className="skeleton-line" />
      <div className="skeleton-line short" />
    </article>
  );
};

export default AlbumSkeleton;
