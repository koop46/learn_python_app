from sqlalchemy import create_engine, Column, String, Text, Boolean, Integer, ForeignKey
from sqlalchemy.orm import declarative_base, relationship

Base = declarative_base()

class User(Base):

    __tablename__ = 'users'

    id = Column(String(36), primary_key=True)  # Changed to String to match API
    username = Column(String(255), unique=True, nullable=False)
    progress = relationship("UserProgress", back_populates="user")

class UserProgress(Base):

    __tablename__ = 'user_progress'
    
    user_id = Column(String(36), ForeignKey('users.id'), primary_key=True)  # Composite PK
    exercise_id = Column(Integer, primary_key=True)  # Composite PK
    completed = Column(Boolean, server_default="0")
    input_data = Column(Text, nullable=False)
    user = relationship("User", back_populates="progress")

# Create tables
if __name__ == "__main__":
    engine = create_engine('sqlite:///python_course.db', echo=True)
    Base.metadata.create_all(engine)