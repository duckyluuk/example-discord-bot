const discord = require('discord.js');
const users = require('../db/user.js');

const description = 'View the profile of a user'

const options = [
    {
        name: 'user',
        description: 'The user to view the profile of',
        type: discord.ApplicationCommandOptionType.User,
        required: false,
    }
]

const init = async (interaction, client) => {
    const user = interaction.options.getUser('user') || interaction.user;
    const dbUser = await users.findOne({ user_id: user.id });

    if (!dbUser) {
        return interaction.reply({ content: 'User not found', ephemeral: true });
    }

    const embed = {
        title: `Profile of ${user.username}`,
        image: {
            url: user.displayAvatarURL()
        },
        description: `User ID: ${user.id}`,
        fields: [
            {
                name: 'Score',
                value: dbUser.score || 0,
                inline: true
            }
        ]
    }

    interaction.reply({ embeds: [embed], ephemeral: true });
}

module.exports = { init, description, options}
