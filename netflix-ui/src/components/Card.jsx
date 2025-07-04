import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import { IoPlayCircleSharp } from "react-icons/io5";
import { AiOutlinePlus } from "react-icons/ai";
import { RiThumbUpFill, RiThumbDownFill } from "react-icons/ri";
import { BiChevronDown } from "react-icons/bi";
import { BsCheck } from "react-icons/bs";
import axios from "axios";
import { onAuthStateChanged } from "firebase/auth";
import { firebaseAuth } from "../utils/firebase-config";
import { useDispatch } from "react-redux";
import { removeMovieFromLiked } from "../store";
import video from "../assets/videoplayback.mp4";

export default React.memo(function Card({ index, movieData, isLiked = false, onRemove }) {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [isHovered, setIsHovered] = useState(false);
  const [email, setEmail] = useState(undefined);
  const [liked, setLiked] = useState(null);
  const [trailerKey, setTrailerKey] = useState(null);

  onAuthStateChanged(firebaseAuth, (currentUser) => {
    if (currentUser) {
      setEmail(currentUser.email);
    } else navigate("/login");
  });

  useEffect(() => {
    async function fetchTrailer() {
      if (!isHovered) return;
      try {
        // Determine if it's a movie or TV show based on available fields
        const type = movieData.first_air_date ? "tv" : "movie";
        const res = await axios.get(
          `https://api.themoviedb.org/3/${type}/${movieData.id}/videos?api_key=fe6060eaa48b9b5ffe0547efbb190fbe&language=en-US`
        );
        const trailer = res.data.results.find(
          vid => vid.type === "Trailer" && vid.site === "YouTube"
        );
        setTrailerKey(trailer ? trailer.key : null);
      } catch (err) {
        setTrailerKey(null);
      }
    }
    fetchTrailer();
    // Only fetch when hovered
  }, [isHovered, movieData.id]);

  const handleLike = async () => {
    try {
      await axios.post("http://localhost:5000/api/user/add", {
        email,
        data: movieData,
      });
      setLiked(true);
    } catch (error) {
      console.log(error);
    }
  };

  const handleDislike = async () => {
    try {
      await axios.put("http://localhost:5000/api/user/remove", {
        email,
        movieId: movieData.id,
      });
      setLiked(false);
      if (onRemove) onRemove(movieData.id);
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <Container
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <img
        src={`https://image.tmdb.org/t/p/w500${movieData.image}`}
        alt="card"
        onClick={() => navigate("/player")}
      />

      {isHovered && (
        <div className="hover">
          <div className="image-video-container">
            <img
              src={`https://image.tmdb.org/t/p/w500${movieData.image}`}
              alt="card"
              onClick={() => navigate("/player")}
              style={{ display: trailerKey ? "none" : "block" }}
            />
            {trailerKey ? (
              <iframe
                width="100%"
                height="140"
                src={`https://www.youtube.com/embed/${trailerKey}?autoplay=1&mute=1&controls=1`}
                title="Trailer"
                frameBorder="0"
                allow="autoplay; encrypted-media"
                allowFullScreen
                style={{ borderRadius: "0.3rem", position: "absolute", top: 0, left: 0, zIndex: 5 }}
              ></iframe>
            ) : (
              <video
                src={video}
                autoPlay={true}
                loop
                muted
                onClick={() => navigate("/player")}
                style={{ display: trailerKey ? "none" : "block" }}
              />
            )}
          </div>
          <div className="info-container flex column">
            <h3 className="name" onClick={() => navigate("/player")}>
              {movieData.name}
            </h3>
            <div className="icons flex j-between">
              <div className="controls flex">
                <IoPlayCircleSharp
                  title="Play"
                  onClick={() => navigate("/player")}
                />
                <RiThumbUpFill
                  title={liked === true ? "Unlike" : "Like"}
                  style={{ color: liked === true ? "#e50914" : "#fff" }}
                  onClick={handleLike}
                />
                <RiThumbDownFill
                  title={liked === false ? "Disliked" : "Dislike"}
                  style={{ color: liked === false ? "#e50914" : "#fff" }}
                  onClick={handleDislike}
                />
                {liked === true ? (
                  <BsCheck
                    title="Remove from List"
                    onClick={handleDislike}
                  />
                ) : (
                  <AiOutlinePlus title="Add to my list" onClick={handleLike} />
                )}
              </div>
              <div className="info">
                <BiChevronDown title="More Info" />
              </div>
            </div>
            <div className="genres flex">
              <ul className="flex">
                {movieData.genres.map((genre, idx) => (
                  <li key={genre + idx}>{genre}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
    </Container>
  );
});

const Container = styled.div`
  max-width: 230px;
  width: 230px;
  height: 100%;
  cursor: pointer;
  position: relative;
  img {
    border-radius: 0.2rem;
    width: 100%;
    height: 100%;
    z-index: 10;
  }
  .hover {
    z-index: 99;
    height: max-content;
    width: 20rem;
    position: absolute;
    top: -18vh;
    left: 0;
    border-radius: 0.3rem;
    box-shadow: rgba(0, 0, 0, 0.75) 0px 3px 10px;
    background-color: #181818;
    transition: 0.3s ease-in-out;
    .image-video-container {
      position: relative;
      height: 140px;
      img {
        width: 100%;
        height: 140px;
        object-fit: cover;
        border-radius: 0.3rem;
        top: 0;
        z-index: 4;
        position: absolute;
      }
      video {
        width: 100%;
        height: 140px;
        object-fit: cover;
        border-radius: 0.3rem;
        top: 0;
        z-index: 5;
        position: absolute;
      }
    }
    .info-container {
      padding: 1rem;
      gap: 0.5rem;
    }
    .icons {
      .controls {
        display: flex;
        gap: 1rem;
      }
      svg {
        font-size: 2rem;
        cursor: pointer;
        transition: 0.3s ease-in-out;
        &:hover {
          color: #b8b8b8;
        }
      }
    }
    .genres {
      ul {
        gap: 1rem;
        li {
          padding-right: 0.7rem;
          &:first-of-type {
            list-style-type: none;
          }
        }
      }
    }
  }
`;