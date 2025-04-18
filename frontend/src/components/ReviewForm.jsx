import React, { useState } from 'react';
import { Form, Button, Alert } from 'react-bootstrap';
import { FaStar } from 'react-icons/fa';

const ReviewForm = ({ propertyId, onReviewSubmitted }) => {
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [comment, setComment] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (rating === 0) {
      setError('Te rugăm să selectezi un rating');
      return;
    }

    setIsSubmitting(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch(`/api/proprietati/${propertyId}/reviews`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          rating,
          comment
        })
      });

      if (!response.ok) {
        throw new Error('Nu s-a putut adăuga recenzia');
      }

      const data = await response.json();
      setSuccess('Recenzia a fost adăugată cu succes!');
      setRating(0);
      setComment('');
      
      if (onReviewSubmitted) {
        onReviewSubmitted(data);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="review-form-container">
      <h4>Adaugă o recenzie</h4>
      
      {error && <Alert variant="danger">{error}</Alert>}
      {success && <Alert variant="success">{success}</Alert>}
      
      <Form onSubmit={handleSubmit}>
        <div className="star-rating mb-3">
          {[...Array(5)].map((_, index) => {
            const ratingValue = index + 1;
            return (
              <FaStar
                key={index}
                className="star"
                color={ratingValue <= (hover || rating) ? "#ffc107" : "#e4e5e9"}
                size={24}
                style={{ marginRight: '5px', cursor: 'pointer' }}
                onClick={() => setRating(ratingValue)}
                onMouseEnter={() => setHover(ratingValue)}
                onMouseLeave={() => setHover(rating)}
              />
            );
          })}
        </div>
        
        <Form.Group className="mb-3">
          <Form.Label>Comentariul tău</Form.Label>
          <Form.Control
            as="textarea"
            rows={3}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Spune-ne părerea ta despre această cazare..."
          />
        </Form.Group>
        
        <Button 
          type="submit" 
          variant="primary"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Se trimite...' : 'Trimite recenzia'}
        </Button>
      </Form>
    </div>
  );
};

export default ReviewForm; 