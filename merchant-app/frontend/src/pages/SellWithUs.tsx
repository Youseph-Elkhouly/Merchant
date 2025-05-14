import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Stepper,
  Step,
  StepLabel,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  InputAdornment,
  IconButton,
  SelectChangeEvent,
} from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import DeleteIcon from '@mui/icons-material/Delete';
import '../styles/SellWithUs.css';

interface ListingFormData {
  title: string;
  description: string;
  price: string;
  category: string;
  condition: string;
  location: string;
  images: File[];
}

const initialFormData: ListingFormData = {
  title: '',
  description: '',
  price: '',
  category: '',
  condition: '',
  location: '',
  images: [],
};

const SellWithUs: React.FC = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [formData, setFormData] = useState<ListingFormData>(initialFormData);
  const [imagePreviewUrls, setImagePreviewUrls] = useState<string[]>([]);

  const steps = ['Basic Information', 'Details & Condition', 'Images & Location'];

  const categories = [
    'Electronics',
    'Fashion',
    'Home & Garden',
    'Sports',
    'Vehicles',
    'Real Estate',
    'Others',
  ];

  const conditions = ['New', 'Like New', 'Good', 'Fair', 'For Parts'];

  const handleNext = () => {
    setActiveStep((prevStep) => prevStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };

  const handleTextChange = (field: keyof ListingFormData) => (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setFormData({
      ...formData,
      [field]: event.target.value,
    });
  };

  const handleSelectChange = (field: keyof ListingFormData) => (
    event: SelectChangeEvent<string>
  ) => {
    setFormData({
      ...formData,
      [field]: event.target.value,
    });
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    const newImages = [...formData.images, ...files].slice(0, 5); // Limit to 5 images

    setFormData({
      ...formData,
      images: newImages,
    });

    // Create preview URLs for the images
    const newPreviewUrls = newImages.map(file => URL.createObjectURL(file));
    setImagePreviewUrls(newPreviewUrls);
  };

  const handleRemoveImage = (index: number) => {
    const newImages = [...formData.images];
    newImages.splice(index, 1);
    setFormData({
      ...formData,
      images: newImages,
    });

    const newPreviewUrls = [...imagePreviewUrls];
    URL.revokeObjectURL(newPreviewUrls[index]);
    newPreviewUrls.splice(index, 1);
    setImagePreviewUrls(newPreviewUrls);
  };

  const handleSubmit = () => {
    // TODO: Implement API call to create listing
    console.log('Form submitted:', formData);
    // Reset form after successful submission
    setFormData(initialFormData);
    setActiveStep(0);
    setImagePreviewUrls([]);
  };

  const getStepContent = (step: number) => {
    switch (step) {
      case 0:
        return (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <TextField
              fullWidth
              label="Title"
              value={formData.title}
              onChange={handleTextChange('title')}
              placeholder="Enter a descriptive title for your item"
              required
            />
            <TextField
              fullWidth
              label="Description"
              value={formData.description}
              onChange={handleTextChange('description')}
              multiline
              rows={4}
              placeholder="Describe your item in detail"
              required
            />
            <TextField
              fullWidth
              label="Price"
              value={formData.price}
              onChange={handleTextChange('price')}
              type="number"
              InputProps={{
                startAdornment: <InputAdornment position="start">$</InputAdornment>,
              }}
              required
            />
          </Box>
        );

      case 1:
        return (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <FormControl fullWidth required>
              <InputLabel>Category</InputLabel>
              <Select
                value={formData.category}
                onChange={handleSelectChange('category')}
                label="Category"
              >
                {categories.map((category) => (
                  <MenuItem key={category} value={category}>
                    {category}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl fullWidth required>
              <InputLabel>Condition</InputLabel>
              <Select
                value={formData.condition}
                onChange={handleSelectChange('condition')}
                label="Condition"
              >
                {conditions.map((condition) => (
                  <MenuItem key={condition} value={condition}>
                    {condition}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        );

      case 2:
        return (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <TextField
              fullWidth
              label="Location"
              value={formData.location}
              onChange={handleTextChange('location')}
              placeholder="Enter your location"
              required
            />
            <Box>
              <input
                accept="image/*"
                style={{ display: 'none' }}
                id="image-upload"
                type="file"
                multiple
                onChange={handleImageUpload}
              />
              <label htmlFor="image-upload">
                <Button
                  variant="outlined"
                  component="span"
                  startIcon={<CloudUploadIcon />}
                  sx={{
                    color: '#FF4500',
                    borderColor: '#FF4500',
                    '&:hover': {
                      borderColor: '#ff5722',
                      bgcolor: 'rgba(255, 69, 0, 0.1)',
                    },
                  }}
                >
                  Upload Images (Max 5)
                </Button>
              </label>
            </Box>
            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 2 }}>
              {imagePreviewUrls.map((url, index) => (
                <Box
                  key={index}
                  sx={{
                    position: 'relative',
                    paddingTop: '100%',
                    borderRadius: 1,
                    overflow: 'hidden',
                  }}
                >
                  <img
                    src={url}
                    alt={`Preview ${index + 1}`}
                    style={{
                      position: 'absolute',
                      top: 0,
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                    }}
                  />
                  <IconButton
                    onClick={() => handleRemoveImage(index)}
                    sx={{
                      position: 'absolute',
                      top: 8,
                      right: 8,
                      bgcolor: 'rgba(0, 0, 0, 0.5)',
                      '&:hover': {
                        bgcolor: 'rgba(0, 0, 0, 0.7)',
                      },
                    }}
                  >
                    <DeleteIcon sx={{ color: '#ffffff' }} />
                  </IconButton>
                </Box>
              ))}
            </Box>
          </Box>
        );

      default:
        return null;
    }
  };

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
          maxWidth: 800,
          margin: '0 auto',
          p: 4,
          bgcolor: '#262626',
          borderRadius: 2,
          border: '1px solid rgba(255, 69, 0, 0.1)',
        }}
      >
        <Typography
          variant="h4"
          sx={{
            color: '#ffffff',
            textAlign: 'center',
            mb: 4,
            fontFamily: "'Poppins', sans-serif",
          }}
        >
          Create Your Listing
        </Typography>

        <Stepper
          activeStep={activeStep}
          sx={{
            mb: 4,
            '& .MuiStepLabel-label': {
              color: 'rgba(255, 255, 255, 0.7)',
              '&.Mui-active': {
                color: '#FF4500',
              },
              '&.Mui-completed': {
                color: '#FF4500',
              },
            },
          }}
        >
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        {getStepContent(activeStep)}

        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
          <Button
            onClick={handleBack}
            disabled={activeStep === 0}
            sx={{
              color: 'rgba(255, 255, 255, 0.7)',
              '&:hover': {
                color: '#ffffff',
              },
            }}
          >
            Back
          </Button>
          <Button
            variant="contained"
            onClick={activeStep === steps.length - 1 ? handleSubmit : handleNext}
            sx={{
              bgcolor: '#FF4500',
              '&:hover': {
                bgcolor: '#ff5722',
              },
            }}
          >
            {activeStep === steps.length - 1 ? 'Submit Listing' : 'Next'}
          </Button>
        </Box>
      </Paper>
    </Box>
  );
};

export default SellWithUs; 