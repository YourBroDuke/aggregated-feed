import { FastifyInstance } from 'fastify';
import { FollowedUserDalImpl } from '../dal/followed-user-dal.js';
import { UserService } from '../services/user.service.js';

export default async function routes(fastify: FastifyInstance, options: any) {
  const userService = new UserService(new FollowedUserDalImpl());

  // 获取关注用户列表
  fastify.get('/api/followed-users', async (request, reply) => {
    const followedUsers = await userService.getFollowedUsers();
    reply.send(followedUsers);
  });

  // 添加关注用户
  fastify.post('/api/followed-users', async (request, reply) => {
    const { profileUrl } = request.body as { profileUrl: string };
    if (!profileUrl) return reply.code(400).send({ error: 'profileUrl required' });
    const followedUser = await userService.addFollowedUser(profileUrl);
    reply.send(followedUser);
  });

  // 取消关注用户
  fastify.delete('/api/followed-users/:userId', async (request, reply) => {
    const { userId } = request.params as { userId: string };
    const result = await userService.removeFollowedUser(userId);
    reply.send(result);
  });
} 