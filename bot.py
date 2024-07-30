from telebot import TeleBot
from telebot.types import (Message, InlineKeyboardMarkup,
                           InlineKeyboardButton, WebAppInfo)


bot = TeleBot('Your-bot-token')


@bot.message_handler(commands=['start'])
def start(message: Message):
    markup = InlineKeyboardMarkup([
        [InlineKeyboardButton(text='Your MiniApp',
                              web_app=WebAppInfo(
                                  'https://95.169.173.194:777'
                              ))]
    ])

    bot.send_message(chat_id=message.chat.id, text='Your web app:', reply_markup=markup)


if __name__ == '__main__':
    bot.polling(skip_pending=True)
