import React, { useState, useEffect } from 'react';
import { 
  Box,
  Typography, 
  Card, 
  CardContent, 
  CardMedia, 
  IconButton,
  Grid,
  Chip,
  Paper,
  Alert,
  CircularProgress
} from '@mui/material';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import '../styles/BrowseListings.css';
import ApiService from '../services/ApiService';
import AuthService from '../services/AuthService';

interface Listing {
  id: string;
  title?: string;
  price?: number;
  location?: string;
  imageUrl?: string;
  condition?: string;
  category?: string;
  platform?: string;
  url?: string;
  date_posted?: string;
  info?: string;
}

const Favourites: React.FC = () => {
  const [favourites, setFavourites] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(AuthService.isAuthenticated());

  // Load favourites from localStorage on component mount
  useEffect(() => {
    if (!isAuthenticated) {
      setLoading(false);
      return;
    }
    ApiService.getFavourites()
      .then((favs: any[]) => setFavourites(favs.map(fav => ({
        ...fav,
        location: fav.location || '',
        imageUrl: fav.image || '',
        condition: fav.condition || '',
        category: fav.category || '',
        platform: fav.platform || '',
        url: fav.url || '',
        date_posted: fav.date_posted || '',
        info: fav.info || '',
      }))))
      .catch((err: any) => setError('Failed to load favourites'))
      .finally(() => setLoading(false));
  }, [isAuthenticated]);

  const toggleFavourite = async (listing: Listing) => {
    if (!isAuthenticated) return;
    const isFavourited = favourites.some(fav => fav.id === listing.id);
    setLoading(true);
    try {
      if (isFavourited) {
        await ApiService.removeFavourite(listing.id);
        setFavourites(favourites.filter(fav => fav.id !== listing.id));
      } else {
        await ApiService.addFavourite(listing.id);
        setFavourites([...favourites, listing]);
      }
    } catch (err) {
      setError('Failed to update favourites');
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-CA', {
      style: 'currency',
      currency: 'CAD',
    }).format(price);
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-CA', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <Box
        sx={{
          bgcolor: '#1C1C1C',
          minHeight: '100vh',
          pt: '80px',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <CircularProgress sx={{ color: '#FF4500' }} />
      </Box>
    );
  }

  if (error) {
    return (
      <Box
        sx={{
          bgcolor: '#1C1C1C',
          minHeight: '100vh',
          pt: '80px',
          px: { xs: 2, sm: 4, md: 6 },
          pb: 6,
        }}
      >
        <Alert severity="error" sx={{ maxWidth: 600, mx: 'auto' }}>
          {error}
        </Alert>
      </Box>
    );
  }

  if (!isAuthenticated) {
    return (
      <Box sx={{ bgcolor: '#1C1C1C', minHeight: '100vh', pt: '80px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <Alert severity="info">Sign in to view and save your favourites.</Alert>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        bgcolor: '#1C1C1C',
        minHeight: '100vh',
        pt: '80px',
        px: { xs: 2, sm: 4, md: 6 },
        pb: 6,
      }}
    >
      <Paper
        sx={{
          p: 4,
          bgcolor: '#262626',
          borderRadius: 2,
          border: '1px solid rgba(255, 69, 0, 0.1)',
          mb: 4,
        }}
      >
        <Typography
          variant="h4"
          sx={{
            color: '#ffffff',
            textAlign: 'center',
            mb: 2,
            fontFamily: "'Poppins', sans-serif",
            fontWeight: 600,
          }}
        >
          ❤️ My Favourites
        </Typography>
        <Typography
          variant="body1"
          sx={{
            color: 'rgba(255, 255, 255, 0.7)',
            textAlign: 'center',
            mb: 3,
          }}
        >
          {favourites.length === 0 
            ? "You haven't favourited any listings yet. Start browsing to add some!"
            : `${favourites.length} favourited listing${favourites.length !== 1 ? 's' : ''}`
          }
        </Typography>
      </Paper>

      {favourites.length === 0 ? (
        <Paper
          sx={{
            p: 6,
            bgcolor: '#262626',
            borderRadius: 2,
            border: '1px solid rgba(255, 69, 0, 0.1)',
            textAlign: 'center',
          }}
        >
          <Typography
            variant="h6"
            sx={{
              color: 'rgba(255, 255, 255, 0.5)',
              mb: 2,
            }}
          >
            No favourites yet
          </Typography>
          <Typography
            variant="body2"
            sx={{
              color: 'rgba(255, 255, 255, 0.3)',
            }}
          >
            Browse listings and click the heart icon to add items to your favourites
          </Typography>
        </Paper>
      ) : (
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
          {favourites.map((listing) => (
            <Box 
              key={listing.id}
              sx={{ 
                flex: { 
                  xs: '1 1 100%',
                  sm: '1 1 calc(50% - 8px)',
                  md: '1 1 calc(33.33% - 12px)',
                  lg: '1 1 calc(20% - 12px)',
                  xl: '1 1 calc(16.66% - 10px)'
                },
                maxWidth: { lg: '200px', xl: '180px' }
              }}
            >
              <Card
                sx={{
                  bgcolor: '#262626',
                  border: '1px solid rgba(255, 69, 0, 0.1)',
                  borderRadius: 2,
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: '0 8px 25px rgba(255, 69, 0, 0.2)',
                    borderColor: 'rgba(255, 69, 0, 0.3)',
                  },
                }}
              >
                <Box sx={{ position: 'relative' }}>
                  <CardMedia
                    component="img"
                    height="140"
                    image={listing.imageUrl || 'https://via.placeholder.com/300x200?text=No+Image'}
                    alt={listing.title || 'No Title'}
                    sx={{
                      objectFit: 'cover',
                      borderBottom: '1px solid rgba(255, 69, 0, 0.1)',
                    }}
                  />
                  <IconButton
                    onClick={() => toggleFavourite(listing)}
                    sx={{
                      position: 'absolute',
                      top: 8,
                      right: 8,
                      bgcolor: 'rgba(0, 0, 0, 0.5)',
                      color: '#FF4500',
                      '&:hover': {
                        bgcolor: 'rgba(0, 0, 0, 0.7)',
                        color: '#ff5722',
                      },
                    }}
                  >
                    <FavoriteIcon />
                  </IconButton>
                </Box>

                <CardContent sx={{ p: 1.5 }}>
                  <Typography
                    variant="h6"
                    sx={{
                      color: '#ffffff',
                      fontSize: '0.9rem',
                      fontWeight: 600,
                      mb: 0.5,
                      lineHeight: 1.2,
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                    }}
                  >
                    {listing.title || 'No Title'}
                  </Typography>

                  <Typography
                    variant="h6"
                    sx={{
                      color: '#FF4500',
                      fontWeight: 700,
                      mb: 0.5,
                      fontSize: '1rem',
                    }}
                  >
                    {listing.price ? formatPrice(listing.price) : 'N/A'}
                  </Typography>

                  <Box sx={{ display: 'flex', gap: 0.5, mb: 0.5, flexWrap: 'wrap' }}>
                    {listing.condition && (
                      <Chip
                        label={listing.condition}
                        size="small"
                        sx={{
                          bgcolor: 'rgba(255, 69, 0, 0.1)',
                          color: '#FF4500',
                          fontSize: '0.6rem',
                          height: '20px',
                        }}
                      />
                    )}
                    {listing.category && (
                      <Chip
                        label={listing.category}
                        size="small"
                        sx={{
                          bgcolor: 'rgba(255, 255, 255, 0.1)',
                          color: 'rgba(255, 255, 255, 0.8)',
                          fontSize: '0.6rem',
                          height: '20px',
                        }}
                      />
                    )}
                  </Box>

                  <Typography
                    variant="body2"
                    sx={{
                      color: 'rgba(255, 255, 255, 0.6)',
                      fontSize: '0.7rem',
                      mb: 0.5,
                    }}
                  >
                    📍 {listing.location || 'Location not specified'}
                  </Typography>

                  {listing.platform && (
                    <Typography
                      variant="body2"
                      sx={{
                        color: 'rgba(255, 255, 255, 0.5)',
                        fontSize: '0.65rem',
                        fontStyle: 'italic',
                      }}
                    >
                      via {listing.platform}
                    </Typography>
                  )}

                  {listing.date_posted && (
                    <Typography
                      variant="body2"
                      sx={{
                        color: 'rgba(255, 255, 255, 0.4)',
                        fontSize: '0.6rem',
                        mt: 0.5,
                      }}
                    >
                      Posted: {formatDate(listing.date_posted)}
                    </Typography>
                  )}
                                 </CardContent>
               </Card>
             </Box>
           ))}
         </Box>
      )}
    </Box>
  );
};

export default Favourites; 