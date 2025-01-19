// types.ts
export interface User {
  id: string;
  username: string;
  email: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserResponse {
  data: User;
  metadata: {
    version: string;
    timestamp: string;
  };
}

export class UserNotFoundError extends Error {
  constructor(userId: string) {
    super(`User not found: ${userId}`);
    this.name = 'UserNotFoundError';
  }
}

// userController.ts
import { Request, Response, NextFunction } from 'express';
import { User, UserResponse, UserNotFoundError } from './types';

/**
 * @openapi
 * /api/v1/users/{id}:
 *   get:
 *     summary: Get user by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: User found
 *       404:
 *         description: User not found
 *       500:
 *         description: Internal server error
 */
export async function getUserById(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.params.id;
    const user = await findUser(userId);

    if (!user) {
      throw new UserNotFoundError(userId);
    }

    const response: UserResponse = {
      data: user,
      metadata: {
        version: 'v1',
        timestamp: new Date().toISOString()
      }
    };

    res.json(response);
  } catch (error) {
    next(error);
  }
}

// userController.test.ts
import { Request, Response, NextFunction } from 'express';
import { getUserById } from './userController';
import { UserNotFoundError } from './types';

describe('getUserById', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: NextFunction;

  beforeEach(() => {
    mockRequest = {
      params: { id: 'test-user-id' }
    };
    mockResponse = {
      json: jest.fn()
    };
    mockNext = jest.fn();
  });

  it('should return user when found', async () => {
    const mockUser = {
      id: 'test-user-id',
      username: 'testuser',
      email: 'test@example.com',
      createdAt: new Date(),
      updatedAt: new Date()
    };

    // Mockの設定
    global.findUser = jest.fn().mockResolvedValue(mockUser);

    await getUserById(
      mockRequest as Request,
      mockResponse as Response,
      mockNext
    );

    expect(mockResponse.json).toHaveBeenCalledWith({
      data: mockUser,
      metadata: expect.any(Object)
    });
  });

  it('should handle user not found', async () => {
    // Mockの設定
    global.findUser = jest.fn().mockResolvedValue(null);

    await getUserById(
      mockRequest as Request,
      mockResponse as Response,
      mockNext
    );

    expect(mockNext).toHaveBeenCalledWith(
      expect.any(UserNotFoundError)
    );
  });
});