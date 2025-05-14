import './LoadingSkeleton.css';

const LoadingSkeleton = () => {
    return (
      <div className="content-with-banner-sekeleton">
        {/* Banner Skeleton */}
        <div className="skeleton banner-skeleton"></div>
  
        {/* Asset Row Skeletons */}
        {Array.from({ length: 1 }).map((_, rowIndex) => (
          <div className="row-skeleton" key={rowIndex}>
            <div className="skeleton row-title-skeleton"></div>
            <div className="row-thumbnails-skeleton">
              {Array.from({ length: 8 }).map((_, thumbIndex) => (
                <div className="skeleton thumbnail-skeleton" key={thumbIndex}></div>
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  };

  export default LoadingSkeleton
  