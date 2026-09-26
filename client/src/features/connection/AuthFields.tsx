import { useId } from 'react';
import { Input } from '@/components/ui/input';
import type { ConnectionCredentials } from '@/lib/api';

export type AuthMethod = 'user' | 'token' | 'nkey' | 'creds';

export const authMethodOf = (c: ConnectionCredentials): AuthMethod =>
  c.creds ? 'creds' : c.nkeySeed ? 'nkey' : c.token ? 'token' : 'user';

// Send only the chosen method's fields so the server never mixes methods.
export const withOnlyAuth = (
  c: ConnectionCredentials,
  method: AuthMethod
): ConnectionCredentials => ({
  host: c.host,
  port: c.port,
  username: method === 'user' ? c.username : '',
  password: method === 'user' ? c.password : '',
  token: method === 'token' ? c.token : '',
  nkeySeed: method === 'nkey' ? c.nkeySeed : '',
  creds: method === 'creds' ? c.creds : '',
});

type AuthField = 'username' | 'password' | 'token' | 'nkeySeed' | 'creds';

interface AuthFieldsProps {
  value: Partial<ConnectionCredentials>;
  method: AuthMethod;
  onMethodChange: (method: AuthMethod) => void;
  onChange: (field: AuthField, value: string) => void;
  disabled?: boolean;
}

// Auth method picker + its fields; shared by the login form and saved-connection form.
export function AuthFields({
  value,
  method,
  onMethodChange,
  onChange,
  disabled,
}: AuthFieldsProps) {
  const id = useId();
  return (
    <>
      <div className="space-y-1.5">
        <label htmlFor={`${id}-auth-method`} className="text-sm font-medium">
          Authentication
        </label>
        <select
          id={`${id}-auth-method`}
          value={method}
          onChange={(e) => onMethodChange(e.target.value as AuthMethod)}
          disabled={disabled}
          className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
        >
          <option value="user">Username / password</option>
          <option value="token">Token</option>
          <option value="nkey">NKey seed</option>
          <option value="creds">Credentials file (.creds)</option>
        </select>
      </div>
      {method === 'user' && (
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-1.5">
            <label htmlFor={`${id}-username`} className="text-sm font-medium">
              Username
            </label>
            <Input
              id={`${id}-username`}
              type="text"
              autoComplete="username"
              placeholder="optional"
              value={value.username}
              onChange={(e) => onChange('username', e.target.value)}
              disabled={disabled}
            />
          </div>
          <div className="space-y-1.5">
            <label htmlFor={`${id}-password`} className="text-sm font-medium">
              Password
            </label>
            <Input
              id={`${id}-password`}
              type="password"
              autoComplete="current-password"
              placeholder="optional"
              value={value.password}
              onChange={(e) => onChange('password', e.target.value)}
              disabled={disabled}
            />
          </div>
        </div>
      )}
      {method === 'token' && (
        <div className="space-y-1.5">
          <label htmlFor={`${id}-token`} className="text-sm font-medium">
            Token
          </label>
          <Input
            id={`${id}-token`}
            type="password"
            autoComplete="off"
            required
            value={value.token ?? ''}
            onChange={(e) => onChange('token', e.target.value)}
            disabled={disabled}
          />
        </div>
      )}
      {method === 'nkey' && (
        <div className="space-y-1.5">
          <label htmlFor={`${id}-nkey-seed`} className="text-sm font-medium">
            NKey seed
          </label>
          <Input
            id={`${id}-nkey-seed`}
            type="password"
            autoComplete="off"
            required
            placeholder="SU…"
            value={value.nkeySeed ?? ''}
            onChange={(e) => onChange('nkeySeed', e.target.value)}
            disabled={disabled}
          />
        </div>
      )}
      {method === 'creds' && (
        <div className="space-y-1.5">
          <label htmlFor={`${id}-creds`} className="text-sm font-medium">
            Credentials file
          </label>
          <Input
            id={`${id}-creds`}
            type="file"
            accept=".creds,text/plain"
            required={!value.creds}
            onChange={async (e) => {
              const file = e.target.files?.[0];
              if (file) onChange('creds', await file.text());
            }}
            disabled={disabled}
          />
          {value.creds && (
            <p className="text-xs text-muted-foreground">Credentials loaded.</p>
          )}
        </div>
      )}
    </>
  );
}
