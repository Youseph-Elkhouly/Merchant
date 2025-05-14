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
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import { useSearchParams } from 'react-router-dom';
import '../styles/BrowseListings.css';

interface Listing {
  id: string;
  title: string;
  price: number;
  location: string;
  imageUrl: string;
  condition: string;
  category: string;
}

const BrowseListings: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [listings, setListings] = useState<Listing[]>([]);
  const [searchTerm, setSearchTerm] = useState(searchParams.get('q') || '');
  const [sortBy, setSortBy] = useState('newest');
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 5000]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedConditions, setSelectedConditions] = useState<string[]>([]);

  // Temporary mock data
  useEffect(() => {
    const mockListings: Listing[] = Array.from({ length: 12 }, (_, i) => ({
      id: `listing-${i + 1}`,
      title: `Sample Product ${i + 1}`,
      price: Math.floor(Math.random() * 5000),
      location: 'Toronto, ON',
      imageUrl: `https://picsum.photos/400/300?random=${i}`,
      condition: ['New', 'Like New', 'Good', 'Fair'][Math.floor(Math.random() * 4)],
      category: ['Electronics', 'Fashion', 'Home & Garden', 'Sports'][Math.floor(Math.random() * 4)],
    }));
    setListings(mockListings);
  }, []);

  const categories = ['Electronics', 'Fashion', 'Home & Garden', 'Sports'];
  const conditions = ['New', 'Like New', 'Good', 'Fair'];

  const handleSearch = (event: React.FormEvent) => {
    event.preventDefault();
    setSearchParams({ q: searchTerm });
  };

  const toggleCategory = (category: string) => {
    setSelectedCategories(prev =>
      prev.includes(category)
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  const toggleCondition = (condition: string) => {
    setSelectedConditions(prev =>
      prev.includes(condition)
        ? prev.filter(c => c !== condition)
        : [...prev, condition]
    );
  };

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

          {/* Category Filters */}
          <Box sx={{ flex: { xs: '1 1 100%', md: '1 1 calc(50% - 8px)' } }}>
            <Typography color="rgba(255, 255, 255, 0.7)" gutterBottom>
              Categories
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              {categories.map((category) => (
                <Chip
                  key={category}
                  label={category}
                  onClick={() => toggleCategory(category)}
                  color={selectedCategories.includes(category) ? 'primary' : 'default'}
                  sx={{
                    bgcolor: selectedCategories.includes(category) 
                      ? '#FF4500' 
                      : 'rgba(255, 255, 255, 0.1)',
                    color: '#ffffff',
                    '&:hover': {
                      bgcolor: selectedCategories.includes(category)
                        ? '#ff5722'
                        : 'rgba(255, 255, 255, 0.2)',
                    },
                  }}
                />
              ))}
            </Box>
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
        {listings.map((listing) => (
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
              <CardMedia
                component="img"
                height="200"
                image={listing.imageUrl}
                alt={listing.title}
                sx={{ objectFit: 'cover' }}
              />
              <CardContent sx={{ position: 'relative' }}>
                <IconButton
                  className="favorite-button"
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
                  <FavoriteBorderIcon sx={{ color: '#FF4500' }} />
                </IconButton>
                <Typography 
                  gutterBottom 
                  variant="h6" 
                  component="div"
                  sx={{ 
                    color: '#ffffff',
                    fontFamily: "'Poppins', sans-serif",
                    fontSize: '1.1rem'
                  }}
                >
                  {listing.title}
                </Typography>
                <Typography 
                  variant="h6" 
                  color="#FF4500"
                  sx={{ 
                    fontFamily: "'Poppins', sans-serif",
                    fontWeight: 600,
                    mb: 1
                  }}
                >
                  ${listing.price}
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                  <Chip
                    label={listing.category}
                    size="small"
                    sx={{
                      bgcolor: 'rgba(255, 69, 0, 0.1)',
                      color: '#FF4500',
                      fontSize: '0.75rem',
                    }}
                  />
                  <Chip
                    label={listing.condition}
                    size="small"
                    sx={{
                      bgcolor: 'rgba(255, 255, 255, 0.1)',
                      color: '#ffffff',
                      fontSize: '0.75rem',
                    }}
                  />
                </Box>
                <Typography 
                  variant="body2" 
                  sx={{ 
                    color: 'rgba(255, 255, 255, 0.7)',
                    mt: 1,
                    fontSize: '0.85rem'
                  }}
                >
                  {listing.location}
                </Typography>
              </CardContent>
            </Card>
          </Box>
        ))}
        {listings.length === 0 && (
          <Box sx={{ width: '100%' }}>
            <Box className="empty-state">
              <Typography variant="h6">
                No listings found
              </Typography>
              <Typography variant="body1" color="rgba(255, 255, 255, 0.7)">
                Try adjusting your filters or search terms
              </Typography>
            </Box>
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default BrowseListings; 