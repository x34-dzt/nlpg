import Elysia, { t } from "elysia";
import { Chat } from "@db/chat/chat";
import { useAuthGuard } from "./auth";
import { ForbiddenError } from "~/lib/error";

export const useConversationGuard = new Elysia({
  name: "useConversationGuard",
})
  .use(useAuthGuard)
  .guard({
    params: t.Object({
      id: t.String(),
    }),
  })
  .macro("useConversationGuard", {
    useAuthGuard: true,
    async resolve({ params, user }) {
      const conversation = await Chat.findConversationById(params.id);
      if (!conversation || conversation.createdBy !== user.id)
        throw new ForbiddenError("Conversation does not belong to you");
      return { conversation };
    },
  });
