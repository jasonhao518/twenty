import { isNonEmptyString } from '@sniptt/guards';

import { FieldLinkValue } from '@/object-record/record-field/types/FieldMetadata';
import { RoundedLink } from '@/ui/navigation/link/components/RoundedLink';
import {
  LinkType,
  SocialLink,
} from '@/ui/navigation/link/components/SocialLink';

type LinkDisplayProps = {
  value?: FieldLinkValue;
};

export const LinkDisplay = ({ value }: LinkDisplayProps) => {
  const url = value?.url;

  if (!isNonEmptyString(url)) {
    return <></>;
  }

  const absoluteUrl = url
    ? url.startsWith('http')
      ? url
      : url.startsWith('myapp')
        ? url
        : 'https://' + url
    : '';

  const displayedValue = isNonEmptyString(value?.label)
    ? value?.label
    : url?.replace(/^http[s]?:\/\/(?:[w]+\.)?/gm, '').replace(/^[w]+\./gm, '');

  const type = displayedValue.startsWith('linkedin.')
    ? LinkType.LinkedIn
    : displayedValue.startsWith('twitter.')
      ? LinkType.Twitter
      : LinkType.Url;

  if (type === LinkType.LinkedIn || type === LinkType.Twitter) {
    return <SocialLink href={absoluteUrl} type={type} label={displayedValue} />;
  }

  return <RoundedLink href={absoluteUrl} label={displayedValue} />;
};
