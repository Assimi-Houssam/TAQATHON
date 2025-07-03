import { Injectable } from '@nestjs/common';
import { ChatService } from '../chats.service';
import { PurchaseRequest } from 'src/purchase-requests/entities/purchase-request.entity';
import { User } from 'src/users/entities/user.entity';
import { ChatType } from '../enums/chat.enum';
import { Bid } from 'src/bids/entities/bid.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Chat } from '../entities/chat.entity';

@Injectable()
export class PurchaseRequestChatService {
  constructor(
    private readonly chatService: ChatService,
    @InjectRepository(Chat)
    private readonly chatRepository: Repository<Chat>,
  ) {}

  // async createPurchaseRequestChat(
  //   purchaseRequest: PurchaseRequest,
  //   owner: User,
  // ) {
  //   const chatName = `PR-${purchaseRequest.request_code}`;
  //   const chatDescription = `Chat for purchase request: ${purchaseRequest.title}`;

  //   const chat = await this.chatService.createChat(owner.id, {
  //     chat_name: chatName,
  //     chat_description: chatDescription,
  //     chat_type: ChatType.GROUP,
  //     chat_members: [owner.id],
  //   });

  //   return chat;
  // }

  async addBidderToChat(bid: Bid, bidder: User) {
    const purchaseRequest = bid.purchase_request;
    const chatName = `PR-${purchaseRequest.request_code}`;

    const chat = await this.chatRepository.findOne({
      where: { chat_name: chatName },
      relations: ['chat_members'],
    });
    if (!chat) {
      throw new Error(
        `Chat not found for purchase request ${purchaseRequest.request_code}`,
      );
    }

    const isMember = chat.chat_members.some(
      (member: User) => member.id === bidder.id,
    );
    if (!isMember) {
      await this.chatService.inviteUsersToChat(chat.created_by, chat.id, [
        bidder.id,
      ]);
    }

    return chat;
  }
}
