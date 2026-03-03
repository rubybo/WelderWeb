import React from 'react';

interface VideoPlayerProps {
  url: string; // URL for the video (e.g., YouTube embed URL or direct mp4 link)
  title?: string; // Optional title for accessibility
  width?: string; // Optional width (default: 560)
  height?: string; // Optional height (default: 315)
  isYouTube?: boolean; // Flag to determine if it's a YouTube embed (default: true)
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({
  url,
  title = 'Video Player',
  width = '560',
  height = '315',
  isYouTube = true,
}) => {
  if (isYouTube) {
    // Render YouTube iframe embed
    return (
      <iframe
        width={width}
        height={height}
        src={url}
        title={title}
        frameBorder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      ></iframe>
    );
  } else {
    // Render direct HTML5 video player for mp4 or similar
    return (
      <video width={width} height={height} controls title={title}>
        <source src={url} type="video/mp4" />
        Your browser does not support the video tag.
      </video>
    );
  }
};

export default VideoPlayer;
