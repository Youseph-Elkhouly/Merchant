import React, { useState, useEffect } from 'react';
import { 
  Box,
  Typography, 
  Card, 
  CardContent, 
  CardMedia, 
  IconButton,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Slider,
  Chip,
  InputAdornment,
  Paper,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import ScrapeIcon from '@mui/icons-material/Web';
import { useSearchParams } from 'react-router-dom';
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

const formatPrice = (price?: number) => {
  if (typeof price === 'number') {
    return `$${price.toLocaleString('en-CA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }
  return 'N/A';
};

const BrowseListings: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState(searchParams.get('q') || '');
  const [sortBy, setSortBy] = useState('newest');
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 5000]);
  const [selectedConditions, setSelectedConditions] = useState<string[]>([]);
  const [favourites, setFavourites] = useState<Listing[]>([]);
  
  // Scrape modal state
  const [showScrapeModal, setShowScrapeModal] = useState(false);
  const [scrapingStatus, setScrapingStatus] = useState<'idle' | 'scraping' | 'success' | 'error'>('idle');
  const [scrapeParams, setScrapeParams] = useState({
    platform: 'facebook',
    city: 'Toronto',
    query: 'laptop',
    maxPrice: 1000 as number | string,
    email: '',
    password: ''
  });

  const [isAuthenticated, setIsAuthenticated] = useState(AuthService.isAuthenticated());

  // Load favourites from localStorage
  useEffect(() => {
    if (!isAuthenticated) return;
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
      .catch(() => setFavourites([]));
  }, [isAuthenticated]);

  // Fetch real data from API
  useEffect(() => {
    const fetchListings = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await fetch('http://127.0.0.1:5001/api/listings/');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('RAW API listings:', data); // Log raw API response
        
        // Defensive mapping: only map fields that exist
        const transformedListings = (data.data || []).map((listing: any) => {
          let title = listing.title && listing.title.trim() ? listing.title.trim() : '';
          if (!title) title = 'Marketplace Listing';
          const price = typeof listing.price === 'number' && !isNaN(listing.price) ? listing.price : null;
          return {
            id: listing.id?.toString() ?? '',
            title,
            price,
            imageUrl: listing.image || '',
            condition: listing.condition ?? 'Good',
            category: listing.category ?? 'Electronics',
            platform: listing.platform ?? '',
            url: listing.url ?? '',
            date_posted: listing.date_posted ?? '',
            info: listing.info ?? '', // Only one info property
          };
        }).filter((listing: any) => listing.price !== null);
        
        setListings(transformedListings);
      } catch (err) {
        console.error('Error fetching listings:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch listings');
      } finally {
        setLoading(false);
      }
    };

    fetchListings();
  }, []);

  const conditions = ['New', 'Like New', 'Good', 'Fair'];

  const handleSearch = (event: React.FormEvent) => {
    event.preventDefault();
    setSearchParams({ q: searchTerm });
  };

  const toggleCondition = (condition: string) => {
    setSelectedConditions(prev =>
      prev.includes(condition)
        ? prev.filter(c => c !== condition)
        : [...prev, condition]
    );
  };

  const toggleFavourite = async (listing: Listing) => {
    if (!isAuthenticated) {
      alert('Please sign in to favourite listings.');
      return;
    }
    const isFavourited = favourites.some(fav => fav.id === listing.id);
    try {
      if (isFavourited) {
        await ApiService.removeFavourite(listing.id);
        setFavourites(favourites.filter(fav => fav.id !== listing.id));
      } else {
        await ApiService.addFavourite(listing.id);
        setFavourites([...favourites, listing]);
      }
    } catch (err) {
      alert('Failed to update favourites.');
    }
  };

  const handleScrape = async () => {
    setScrapingStatus('scraping');
    try {
      const body: any = {
        platform: scrapeParams.platform,
        city: scrapeParams.city,
        query: scrapeParams.query,
        max_price: typeof scrapeParams.maxPrice === 'string' ? 0 : scrapeParams.maxPrice,
      };
      if (scrapeParams.platform === 'facebook') {
        if (!scrapeParams.email || !scrapeParams.password) {
          alert('Please provide both Facebook email and password to scrape Facebook listings.');
          setScrapingStatus('idle');
          return;
        }
        body.email = scrapeParams.email;
        body.password = scrapeParams.password;
      }
      const response = await fetch('http://127.0.0.1:5001/api/listings/scrape', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });
      if (response.ok) {
        setScrapingStatus('success');
        setTimeout(() => {
          setShowScrapeModal(false);
          setScrapingStatus('idle');
          setScrapeParams(prev => ({ ...prev, email: '', password: '' }));
          window.location.reload();
        }, 2000);
      } else {
        throw new Error('Scraping failed');
      }
    } catch (error) {
      setScrapingStatus('error');
      setTimeout(() => setScrapingStatus('idle'), 3000);
    }
  };

  // Filtering logic
  const filteredListings = listings.filter((listing) => {
    // Search term filter (case-insensitive)
    const matchesSearch =
      searchTerm.trim() === '' ||
      listing.title?.toLowerCase().includes(searchTerm.toLowerCase());
    // Price range filter
    const matchesPrice =
      typeof listing.price === 'number' &&
      listing.price >= priceRange[0] &&
      listing.price <= priceRange[1];
    // Condition filter
    const matchesCondition =
      selectedConditions.length === 0 || selectedConditions.includes(listing.condition || '');
    return matchesSearch && matchesPrice && matchesCondition;
  });

  return (
    <Box sx={{ 
      bgcolor: '#1C1C1C', 
      minHeight: '100vh',
      pt: '80px',
      px: { xs: 2, sm: 4, md: 6 },
      pb: 6
    }}>
      {/* Filters Section */}
      <Paper sx={{ 
        p: 3, 
        mb: 4, 
        bgcolor: '#262626',
        borderRadius: 2,
        border: '1px solid rgba(255, 69, 0, 0.1)'
      }}>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
          {/* Search Bar */}
          <Box sx={{ flex: { xs: '1 1 100%', md: '1 1 calc(33.33% - 16px)' } }}>
            <form onSubmit={handleSearch}>
              <TextField
                fullWidth
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search listings..."
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon sx={{ color: 'rgba(255, 255, 255, 0.7)' }} />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    color: '#ffffff',
                    '& fieldset': { borderColor: 'rgba(255, 69, 0, 0.3)' },
                    '&:hover fieldset': { borderColor: 'rgba(255, 69, 0, 0.5)' },
                    '&.Mui-focused fieldset': { borderColor: '#FF4500' },
                  },
                }}
              />
            </form>
          </Box>

          {/* Sort By */}
          <Box sx={{ flex: { xs: '1 1 100%', md: '1 1 calc(33.33% - 16px)' } }}>
            <FormControl fullWidth>
              <InputLabel sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>Sort By</InputLabel>
              <Select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                sx={{
                  color: '#ffffff',
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: 'rgba(255, 69, 0, 0.3)',
                  },
                  '&:hover .MuiOutlinedInput-notchedOutline': {
                    borderColor: 'rgba(255, 69, 0, 0.5)',
                  },
                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#FF4500',
                  },
                }}
              >
                <MenuItem value="newest">Newest First</MenuItem>
                <MenuItem value="price_low">Price: Low to High</MenuItem>
                <MenuItem value="price_high">Price: High to Low</MenuItem>
                <MenuItem value="popular">Most Popular</MenuItem>
              </Select>
            </FormControl>
          </Box>

          {/* Price Range */}
          <Box sx={{ flex: { xs: '1 1 100%', md: '1 1 calc(33.33% - 16px)' } }}>
            <Typography color="rgba(255, 255, 255, 0.7)" gutterBottom>
              Price Range: ${priceRange[0]} - ${priceRange[1]}
            </Typography>
            <Slider
              value={priceRange}
              onChange={(_, newValue) => setPriceRange(newValue as [number, number])}
              valueLabelDisplay="auto"
              min={0}
              max={5000}
              sx={{
                color: '#FF4500',
                '& .MuiSlider-thumb': {
                  '&:hover, &.Mui-focusVisible': {
                    boxShadow: '0 0 0 8px rgba(255, 69, 0, 0.16)',
                  },
                },
                '& .MuiSlider-rail': {
                  opacity: 0.3,
                },
              }}
            />
          </Box>

          {/* Condition Filters */}
          <Box sx={{ flex: { xs: '1 1 100%', md: '1 1 calc(50% - 8px)' } }}>
            <Typography color="rgba(255, 255, 255, 0.7)" gutterBottom>
              Condition
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              {conditions.map((condition) => (
                <Chip
                  key={condition}
                  label={condition}
                  onClick={() => toggleCondition(condition)}
                  color={selectedConditions.includes(condition) ? 'primary' : 'default'}
                  sx={{
                    bgcolor: selectedConditions.includes(condition) 
                      ? '#FF4500' 
                      : 'rgba(255, 255, 255, 0.1)',
                    color: '#ffffff',
                    '&:hover': {
                      bgcolor: selectedConditions.includes(condition)
                        ? '#ff5722'
                        : 'rgba(255, 255, 255, 0.2)',
                    },
                  }}
                />
              ))}
            </Box>
          </Box>
        </Box>
      </Paper>

      {/* Listings Grid */}
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
        {loading ? (
          <Box sx={{ width: '100%', textAlign: 'center', py: 4 }}>
            <Typography variant="h6">Loading listings...</Typography>
          </Box>
        ) : error ? (
          <Box sx={{ width: '100%', textAlign: 'center', py: 4 }}>
            <Typography variant="h6" color="error">{error}</Typography>
          </Box>
        ) : filteredListings.length === 0 ? (
          <Box sx={{ width: '100%' }}>
            <Box className="empty-state">
              <Typography variant="h6">
                No listings found
              </Typography>
              <Typography variant="body1" color="rgba(255, 255, 255, 0.7)">
                Try adjusting your filters
              </Typography>
            </Box>
          </Box>
        ) : (
          filteredListings.map((listing) => (
          <Box 
            key={listing.id}
            sx={{ 
              flex: { 
                xs: '1 1 100%',
                sm: '1 1 calc(50% - 12px)',
                md: '1 1 calc(33.33% - 16px)',
                lg: '1 1 calc(25% - 18px)'
              }
            }}
          >
            <Card className="listing-card" sx={{ 
              bgcolor: '#262626',
              borderRadius: 2,
              border: '1px solid rgba(255, 69, 0, 0.1)',
              transition: 'transform 0.2s ease-in-out',
              '&:hover': {
                transform: 'translateY(-4px)',
              }
            }}>
                {listing.imageUrl ? (
              <CardMedia
                component="img"
                height="200"
                image={listing.imageUrl}
                alt={listing.title || 'Listing Image'}
                sx={{ objectFit: 'cover' }}
              />
                ) : null}
              <CardContent sx={{ position: 'relative' }}>
                <IconButton
                  className="favorite-button"
                  onClick={() => toggleFavourite(listing)}
                  sx={{
                    position: 'absolute',
                    top: -20,
                    right: 8,
                    bgcolor: 'rgba(255, 255, 255, 0.1)',
                    '&:hover': {
                      bgcolor: 'rgba(255, 69, 0, 0.2)',
                    }
                  }}
                >
                  {favourites.some(fav => fav.id === listing.id) ? (
                    <FavoriteIcon sx={{ color: '#FF4500' }} />
                  ) : (
                    <FavoriteBorderIcon sx={{ color: '#FF4500' }} />
                  )}
                </IconButton>
                  {/* Headline: Name as hyperlink */}
                <Typography 
                  gutterBottom 
                  variant="h6" 
                  component="div"
                  sx={{ 
                    color: '#ffffff',
                    fontFamily: "'Poppins', sans-serif",
                      fontSize: '1.1rem',
                      mb: 1
                  }}
                  >
                    <a
                      href={listing.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ color: '#fff', textDecoration: 'underline' }}
                >
                  {listing.title ?? 'Marketplace Listing'}
                    </a>
                  </Typography>
                  {/* Info section */}
                  {listing.info && (
                    <Typography
                      variant="body2"
                      sx={{ color: 'rgba(255,255,255,0.85)', mb: 1 }}
                    >
                      {listing.info}
                </Typography>
                  )}
                <Typography 
                  variant="h6" 
                  color="#FF4500"
                  sx={{ 
                    fontFamily: "'Poppins', sans-serif",
                    fontWeight: 600,
                    mb: 1
                  }}
                >
                  {formatPrice(listing.price as number | undefined)}
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                  <Chip
                    label={listing.category || 'Uncategorized'}
                    size="small"
                    sx={{
                      bgcolor: 'rgba(255, 69, 0, 0.1)',
                      color: '#FF4500',
                      fontSize: '0.75rem',
                    }}
                  />
                  <Chip
                    label={listing.condition || 'Unknown'}
                    size="small"
                    sx={{
                      bgcolor: 'rgba(255, 255, 255, 0.1)',
                      color: '#ffffff',
                      fontSize: '0.75rem',
                    }}
                  />
                </Box>
              </CardContent>
            </Card>
            </Box>
          ))
        )}
      </Box>
    </Box>
  );
};

export default BrowseListings; 