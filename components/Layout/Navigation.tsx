import ArrowCircleUpRoundedIcon from '@mui/icons-material/ArrowCircleUpRounded';
import AutoFixHighRoundedIcon from '@mui/icons-material/AutoFixHighRounded';
import ChatBubbleIcon from '@mui/icons-material/ChatBubbleOutlineRounded';
import ExpandMoreRoundedIcon from '@mui/icons-material/ExpandMoreRounded';
import InboxRoundedIcon from '@mui/icons-material/InboxRounded';
import LinkedInIcon from '@mui/icons-material/LinkedIn';
import ManageAccountsRoundedIcon from '@mui/icons-material/ManageAccountsRounded';
import QuestionMarkRoundedIcon from '@mui/icons-material/QuestionMarkRounded';
import SmartToyRoundedIcon from '@mui/icons-material/SmartToyRounded'; // Icons import
import StorageRoundedIcon from '@mui/icons-material/StorageRounded';
import TwitterIcon from '@mui/icons-material/Twitter';
import Avatar from '@mui/joy/Avatar';
import Badge from '@mui/joy/Badge';
import Box from '@mui/joy/Box';
import Button from '@mui/joy/Button';
import Card from '@mui/joy/Card';
import Chip from '@mui/joy/Chip';
import Divider from '@mui/joy/Divider';
import IconButton from '@mui/joy/IconButton';
import LinearProgress from '@mui/joy/LinearProgress';
import List from '@mui/joy/List';
import ListItem from '@mui/joy/ListItem';
import ListItemButton from '@mui/joy/ListItemButton';
import ListItemContent from '@mui/joy/ListItemContent';
import ListItemDecorator from '@mui/joy/ListItemDecorator';
import Menu from '@mui/joy/Menu';
import MenuItem from '@mui/joy/MenuItem';
import Stack from '@mui/joy/Stack';
import SvgIcon from '@mui/joy/SvgIcon';
import Typography from '@mui/joy/Typography';
import { Prisma } from '@prisma/client';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { signOut, useSession } from 'next-auth/react';
import * as React from 'react';
import useSWR from 'swr';

import { countUnread } from '@app/pages/api/logs/count-unread';
import { getStatus } from '@app/pages/api/status';
import { AppStatus, RouteNames } from '@app/types';
import accountConfig from '@app/utils/account-config';
import { fetcher } from '@app/utils/swr-fetcher';

import ColorSchemeToggle from './ColorSchemeToggle';

export default function Navigation() {
  const router = useRouter();
  const session = useSession();
  const [userMenuElement, setUserMenuElement] =
    React.useState<null | HTMLElement>(null);

  const openUserMenu = (event: React.MouseEvent<HTMLButtonElement>) => {
    setUserMenuElement(event.currentTarget);
  };

  const closeUserMenu = () => {
    setUserMenuElement(null);
  };

  const getDatastoresQuery = useSWR<Prisma.PromiseReturnType<typeof getStatus>>(
    '/api/status',
    fetcher,
    {
      refreshInterval: 60000,
    }
  );

  const countUnreadQuery = useSWR<Prisma.PromiseReturnType<typeof countUnread>>(
    '/api/logs/count-unread',
    fetcher,
    {
      refreshInterval: 60000,
    }
  );

  const isStatusOK = getDatastoresQuery?.data?.status === AppStatus.OK;
  const isMaintenance = !!getDatastoresQuery?.data?.isMaintenance;

  const isMenuOpen = Boolean(userMenuElement);
  const usageQueryRate =
    ((session?.data?.user?.usage?.nbAgentQueries || 0) /
      accountConfig?.[session?.data?.user?.currentPlan!]?.limits
        ?.maxAgentsQueries) *
    100;

  const usageDataRate =
    ((session?.data?.user?.usage?.nbDataProcessingBytes || 0) /
      accountConfig?.[session?.data?.user?.currentPlan!]?.limits
        ?.maxDataProcessing) *
    100;

  React.useEffect(() => {
    if (
      isMaintenance &&
      router.route !== RouteNames.MAINTENANCE &&
      router.route !== '/'
    ) {
      router.push(RouteNames.MAINTENANCE);
    }
  }, [isMaintenance]);

  const items = React.useMemo(() => {
    return [
      {
        label: 'Agents',
        route: RouteNames.AGENTS,
        icon: <SmartToyRoundedIcon fontSize="small" />,
        active: router.route === RouteNames.AGENTS,
      },
      {
        label: 'Datastores',
        route: RouteNames.DATASTORES,
        icon: <StorageRoundedIcon fontSize="small" />,
        active: router.route === RouteNames.DATASTORES,
      },
      {
        label: 'Logs',
        route: RouteNames.LOGS,
        icon: (
          <Badge
            badgeContent={countUnreadQuery?.data}
            size="sm"
            color="danger"
            invisible={!countUnreadQuery?.data || countUnreadQuery?.data <= 0}
          >
            <InboxRoundedIcon fontSize="small" />
          </Badge>
        ),
        active: router.route === RouteNames.LOGS,
      },
      // {
      //   label: 'Chat',
      //   route: RouteNames.CHAT,
      //   icon: <ChatBubbleIcon fontSize="small" />,
      //   active: router.route === RouteNames.CHAT,
      // },
      // {
      //   label: 'Apps',
      //   route: RouteNames.APPS,
      //   icon: <AutoFixHighRoundedIcon fontSize="small" />,
      //   active: router.route === RouteNames.APPS,
      // },
      {
        label: 'Account',
        route: RouteNames.ACCOUNT,
        icon: <ManageAccountsRoundedIcon fontSize="small" />,
        active: router.route === RouteNames.ACCOUNT,
      },
      {
        label: 'Documentation',
        route: 'https://docs.chaindesk.ai/',
        icon: <QuestionMarkRoundedIcon fontSize="small" />,
        target: 'blank',
      },
    ];
  }, [router.route, countUnreadQuery?.data]);

  return (
    <Stack sx={{ height: '100%' }}>
      <List size="sm" sx={{ '--ListItem-radius': '8px' }}>
        <ListItem nested>
          {/* <ListSubheader>
          Browse
          <IconButton
            size="sm"
            variant="plain"
            color="primary"
            sx={{ '--IconButton-size': '24px', ml: 'auto' }}
          >
            <KeyboardArrowDownRoundedIcon fontSize="small" color="primary" />
          </IconButton>
        </ListSubheader> */}
          <List
            aria-labelledby="nav-list-browse"
            sx={{
              '& .JoyListItemButton-root': { p: '8px' },
            }}
          >
            {items.map((each) => (
              <Link key={each.route} href={each.route} target={each?.target}>
                <ListItem>
                  <ListItemButton
                    variant={each.active ? 'soft' : 'plain'}
                    color={each.active ? 'primary' : 'neutral'}
                  >
                    <ListItemDecorator
                      sx={{ color: each.active ? 'inherit' : 'neutral.500' }}
                    >
                      {each.icon}
                    </ListItemDecorator>
                    <ListItemContent>{each.label}</ListItemContent>
                  </ListItemButton>
                </ListItem>
              </Link>
            ))}
          </List>
        </ListItem>
        {/* <ListItem nested sx={{ mt: 2 }}>
        <ListSubheader>
          Tags
          <IconButton
            size="sm"
            variant="plain"
            color="primary"
            sx={{ '--IconButton-size': '24px', ml: 'auto' }}
          >
            <KeyboardArrowDownRoundedIcon fontSize="small" color="primary" />
          </IconButton>
        </ListSubheader>
        <List
          aria-labelledby="nav-list-tags"
          size="sm"
          sx={{
            '--ListItemDecorator-size': '32px',
            '& .JoyListItemButton-root': { p: '8px' },
          }}
        >
          <ListItem>
            <ListItemButton>
              <ListItemDecorator>
                <Box
                  sx={{
                    width: '10px',
                    height: '10px',
                    borderRadius: '99px',
                    bgcolor: 'primary.300',
                  }}
                />
              </ListItemDecorator>
              <ListItemContent>Personal</ListItemContent>
            </ListItemButton>
          </ListItem>
          <ListItem>
            <ListItemButton>
              <ListItemDecorator>
                <Box
                  sx={{
                    width: '10px',
                    height: '10px',
                    borderRadius: '99px',
                    bgcolor: 'danger.300',
                  }}
                />
              </ListItemDecorator>
              <ListItemContent>Work</ListItemContent>
            </ListItemButton>
          </ListItem>
          <ListItem>
            <ListItemButton>
              <ListItemDecorator>
                <Box
                  sx={{
                    width: '10px',
                    height: '10px',
                    borderRadius: '99px',
                    bgcolor: 'warning.200',
                  }}
                />
              </ListItemDecorator>
              <ListItemContent>Travels</ListItemContent>
            </ListItemButton>
          </ListItem>
          <ListItem>
            <ListItemButton>
              <ListItemDecorator>
                <Box
                  sx={{
                    width: '10px',
                    height: '10px',
                    borderRadius: '99px',
                    bgcolor: 'success.300',
                  }}
                />
              </ListItemDecorator>
              <ListItemContent>Concert tickets</ListItemContent>
            </ListItemButton>
          </ListItem>
        </List>
      </ListItem> */}
      </List>

      <Stack gap={1}>
        <Card variant="outlined" size="sm">
          <Stack
            direction="row"
            justifyContent={'space-between'}
            alignItems={'start'}
            gap={1}
          >
            <Button
              onClick={openUserMenu as any}
              id="basic-demo-button"
              aria-controls={isMenuOpen ? 'basic-menu' : undefined}
              aria-haspopup="true"
              aria-expanded={isMenuOpen ? 'true' : undefined}
              variant="plain"
              size={'sm'}
              color="neutral"
              sx={{
                flexDirection: 'row',
                display: 'flex',
                gap: 1,
                width: '100%',
                maxWidth: '100%',
                justifyContent: 'space-between',
                // borderRadius: 99,
              }}
              className="truncate"
              endDecorator={<ExpandMoreRoundedIcon />}
            >
              <Avatar
                size="sm"
                src={session?.data?.user?.image!}
                sx={{
                  ':hover': {
                    cursor: 'pointer',
                  },
                }}
              />

              <Typography
                className="truncate"
                sx={{ maxWidth: '100%' }}
                level="body2"
              >
                {session?.data?.user?.name || session?.data?.user?.email}
              </Typography>
              <Chip
                size="sm"
                variant="outlined"
                color="warning"
                sx={{ ml: 'auto' }}
              >
                {accountConfig?.[session?.data?.user?.currentPlan!]?.label}
              </Chip>
            </Button>

            <Menu
              id="basic-menu"
              anchorEl={userMenuElement}
              open={isMenuOpen}
              onClose={closeUserMenu}
              aria-labelledby="basic-demo-button"
              placement="bottom-start"
              sx={(theme) => ({
                zIndex: theme.zIndex.tooltip,
              })}
            >
              <MenuItem>{session?.data?.user?.email}</MenuItem>
              <Divider />
              <MenuItem onClick={() => signOut()}>Logout</MenuItem>
            </Menu>

            <ColorSchemeToggle />
          </Stack>
          <Stack gap={1}>
            <Stack width={'100%'} gap={1}>
              <Typography level="body3" sx={{ textAlign: 'right' }}>
                {`${session?.data?.user?.usage?.nbAgentQueries?.toLocaleString(
                  'en-US'
                )} / ${accountConfig?.[
                  session?.data?.user?.currentPlan!
                ]?.limits?.maxAgentsQueries?.toLocaleString('en-US')} queries`}
              </Typography>
              <LinearProgress
                determinate
                color={usageQueryRate >= 80 ? 'danger' : 'neutral'}
                value={usageQueryRate}
                sx={{ overflow: 'hidden' }}
              />
            </Stack>
            <Stack width={'100%'} gap={1}>
              <Typography level="body3" sx={{ textAlign: 'right' }}>
                {`${(
                  (session?.data?.user?.usage?.nbDataProcessingBytes || 0) /
                  1000000
                )?.toFixed(2)} / ${
                  accountConfig?.[session?.data?.user?.currentPlan!]?.limits
                    ?.maxDataProcessing / 1000000
                } MB processed`}
              </Typography>
              <LinearProgress
                determinate
                color={usageDataRate >= 80 ? 'danger' : 'neutral'}
                value={usageDataRate}
                sx={{ overflow: 'hidden' }}
              />
            </Stack>
          </Stack>
        </Card>

        <Link href={RouteNames.ACCOUNT} style={{ width: '100%' }}>
          <Button
            size="sm"
            color="warning"
            sx={(theme) => ({
              width: '100%',
              // background: theme.palette.warning[100],
              // color: theme.colorSchemes.light.palette.text.primary,
            })}
            startDecorator={<ArrowCircleUpRoundedIcon />}
            variant="soft"
          >
            Upgrade Plan
          </Button>
        </Link>
      </Stack>

      <Divider sx={{ my: 2 }}></Divider>

      <Stack gap={1}>
        <Stack direction="row" justifyContent={'center'} gap={1}>
          <Link href="https://twitter.com/chaindesk_ai" target="_blank">
            <IconButton variant="plain" size="sm" color="neutral">
              <TwitterIcon />
            </IconButton>
          </Link>
          <Link
            href="https://www.linkedin.com/company/chaindesk"
            target="_blank"
          >
            <IconButton variant="plain" size="sm" color="neutral">
              <LinkedInIcon />
            </IconButton>
          </Link>
          <Link href="https://discord.com/invite/FSWKj49ckX" target="_blank">
            <IconButton variant="plain" size="sm" color="neutral">
              <SvgIcon>
                <svg
                  viewBox="0 -28.5 256 256"
                  version="1.1"
                  xmlns="http://www.w3.org/2000/svg"
                  preserveAspectRatio="xMidYMid"
                  fill="currentColor"
                >
                  <g>
                    <path
                      d="M216.856339,16.5966031 C200.285002,8.84328665 182.566144,3.2084988 164.041564,0 C161.766523,4.11318106 159.108624,9.64549908 157.276099,14.0464379 C137.583995,11.0849896 118.072967,11.0849896 98.7430163,14.0464379 C96.9108417,9.64549908 94.1925838,4.11318106 91.8971895,0 C73.3526068,3.2084988 55.6133949,8.86399117 39.0420583,16.6376612 C5.61752293,67.146514 -3.4433191,116.400813 1.08711069,164.955721 C23.2560196,181.510915 44.7403634,191.567697 65.8621325,198.148576 C71.0772151,190.971126 75.7283628,183.341335 79.7352139,175.300261 C72.104019,172.400575 64.7949724,168.822202 57.8887866,164.667963 C59.7209612,163.310589 61.5131304,161.891452 63.2445898,160.431257 C105.36741,180.133187 151.134928,180.133187 192.754523,160.431257 C194.506336,161.891452 196.298154,163.310589 198.110326,164.667963 C191.183787,168.842556 183.854737,172.420929 176.223542,175.320965 C180.230393,183.341335 184.861538,190.991831 190.096624,198.16893 C211.238746,191.588051 232.743023,181.531619 254.911949,164.955721 C260.227747,108.668201 245.831087,59.8662432 216.856339,16.5966031 Z M85.4738752,135.09489 C72.8290281,135.09489 62.4592217,123.290155 62.4592217,108.914901 C62.4592217,94.5396472 72.607595,82.7145587 85.4738752,82.7145587 C98.3405064,82.7145587 108.709962,94.5189427 108.488529,108.914901 C108.508531,123.290155 98.3405064,135.09489 85.4738752,135.09489 Z M170.525237,135.09489 C157.88039,135.09489 147.510584,123.290155 147.510584,108.914901 C147.510584,94.5396472 157.658606,82.7145587 170.525237,82.7145587 C183.391518,82.7145587 193.761324,94.5189427 193.539891,108.914901 C193.539891,123.290155 183.391518,135.09489 170.525237,135.09489 Z"
                      fillRule="nonzero"
                    ></path>
                  </g>
                </svg>
              </SvgIcon>
            </IconButton>
          </Link>
        </Stack>
        <Link href="mailto:support@chaindesk.ai" className="mx-auto">
          <Typography level="body2" mx={'auto'}>
            support@chaindesk.ai
          </Typography>
        </Link>

        <Chip
          color={isStatusOK ? 'success' : 'danger'}
          variant="soft"
          sx={{ mx: 'auto' }}
        >
          <Stack direction="row" alignItems={'center'} gap={1}>
            <Box
              sx={{
                width: '10px',
                height: '10px',
                borderRadius: '99px',
                bgcolor: isStatusOK ? 'success.300' : 'danger.500',
              }}
            />
            <Typography level="body2">
              system status: {isStatusOK ? 'ok' : 'ko'}
            </Typography>
          </Stack>
        </Chip>
      </Stack>
    </Stack>
  );
}
