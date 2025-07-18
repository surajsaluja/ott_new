import React from 'react';
import './index.css';
import ContentScroller from '../Common/ContentScroller';

const flattenCast = (data) => {
  const combined = [];

  Object.entries(data).forEach(([role, members]) => {
    members.forEach((member) => {
      combined.push({
        ...member,
        role
      });
    });
  });

  return combined;
};

const Credits = ({ data }) => {
  const allMembers = flattenCast(data);


  return (
    <div className="credits-container">
      <ContentScroller>
      <div className="credits-row">
        {allMembers.map((person, index) => (
          <div key={index} className="credits-card">
            <img
              src={person.profileImage}
              alt={person.displayName}
              className="credits-image"
            />
            <div className="credits-role">{person.role}</div>
            <div className="credits-name">{person.displayName}</div>
          </div>
        ))}
      </div>
      </ContentScroller>
    </div>
  );
};

export default Credits;