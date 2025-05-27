import React from 'react';
import { Form, Image } from 'react-bootstrap';
import { PencilSquare } from 'react-bootstrap-icons';

const ProfileImage = ({ imageUrl, onImageChange }) => (
    <div className="position-relative d-inline-block ms-3">
        <Image
            src={imageUrl || 'https://placehold.co/80x80/cccccc/333333?text=Perfil'}
            alt="Perfil del Trabajador"
            roundedCircle
            style={{ width: '80px', height: '80px', objectFit: 'cover' }}
        />
        <Form.Group className="position-absolute bottom-0 end-0 mb-1 me-1">
            <Form.Control
                type="file"
                accept="image/*"
                onChange={onImageChange}
                className="d-none"
                id="upload-profile-image"
            />
            <Form.Label htmlFor="upload-profile-image" className="bg-light border rounded-circle p-1" style={{ cursor: 'pointer' }}>
                <PencilSquare size={16} className="text-secondary" />
            </Form.Label>
        </Form.Group>
    </div>
);

export default ProfileImage;